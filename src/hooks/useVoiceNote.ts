import { useCallback, useRef, useState } from 'react'

/**
 * Streaming dictation for the note box, via OpenAI realtime transcription.
 *
 * A rep is standing in a loud hall holding a coffee — typing a note is the
 * thing that does not happen, so the note gets lost.
 *
 * Text reaches the box two ways, and the first must never depend on the second:
 *
 *  1. `onLive` — every transcription delta, the instant it arrives. This is
 *     what the rep sees while talking. It does not wait for a pause.
 *  2. `onText` — the finalised transcript for a phrase, once the audio buffer
 *     is committed. It replaces the live text for that phrase.
 *
 * gpt-live-transcribe does not support server-side turn detection, so the
 * client commits the buffer itself on pauses. Pause detection is best-effort:
 * if it never fires, the 12s cap or the stop button commits instead, and the
 * rep has been watching live text the whole time either way.
 *
 * Audio is captured at 24 kHz mono PCM16, which is what the session expects.
 */

export type VoiceState = 'idle' | 'connecting' | 'listening' | 'error'

const SAMPLE_RATE = 24000
const SILENCE_MS = 700
const MIN_PHRASE_MS = 400
const MAX_PHRASE_MS = 12000
// Speech must be this much louder than the room's noise floor.
const SPEECH_FACTOR = 2.2
// Absolute floor so a dead-silent room does not turn every rustle into speech.
const MIN_FLOOR = 0.004
// The noise floor is the quietest frame in the last ~3s. A running minimum
// cannot lock up: the previous estimator only updated while "not speaking",
// so a room louder than its own starting threshold was classed as speech
// forever and no pause was ever detected.
const FLOOR_WINDOW_FRAMES = 18
// The first frames only calibrate the floor; nothing is classified until the
// window holds a reference.
const CALIBRATION_FRAMES = 2
// Audio this loud is speech whatever the floor estimate says. Covers a rep
// who starts talking before the window has heard any room noise — otherwise
// the quietest *speech* frame becomes the floor and speech classes as quiet.
const LOUD = 0.06

function rms(input: Float32Array): number {
  let sum = 0
  for (let i = 0; i < input.length; i++) sum += input[i] * input[i]
  return Math.sqrt(sum / input.length)
}

function floatToPcm16Base64(input: Float32Array): string {
  const buffer = new ArrayBuffer(input.length * 2)
  const view = new DataView(buffer)
  for (let i = 0; i < input.length; i++) {
    const clamped = Math.max(-1, Math.min(1, input[i]))
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true)
  }
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

interface Options {
  /** Finalised text for one phrase. Replaces the live text for that phrase. */
  onText: (text: string) => void
  /** All not-yet-finalised text, updated on every delta. */
  onLive: (text: string) => void
}

interface Pending {
  id: string
  text: string
}

export function useVoiceNote({ onText, onLive }: Options) {
  const [state, setState] = useState<VoiceState>('idle')
  const [error, setError] = useState<string | null>(null)

  const socket = useRef<WebSocket | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const audioCtx = useRef<AudioContext | null>(null)
  const node = useRef<ScriptProcessorNode | null>(null)

  // Phrases the API has started transcribing but not yet finalised, keyed by
  // item so a commit for phrase N cannot swallow the first deltas of N+1.
  const pending = useRef<Pending[]>([])
  const spokenMs = useRef(0)
  const quietMs = useRef(0)
  const phraseMs = useRef(0)
  const levels = useRef<number[]>([])

  const emitLive = useCallback(() => {
    onLive(pending.current.map((p) => p.text).join(' ').trim())
  }, [onLive])

  /** Forget in-flight phrases — the rep has taken over the box by hand. */
  const discardPending = useCallback(() => {
    pending.current = []
    onLive('')
  }, [onLive])

  const stop = useCallback(() => {
    const ws = socket.current
    const flush = ws?.readyState === WebSocket.OPEN && spokenMs.current >= MIN_PHRASE_MS

    // Release the mic straight away — the recording indicator must stop the
    // instant the button is tapped.
    node.current?.disconnect()
    node.current = null
    void audioCtx.current?.close().catch(() => {})
    audioCtx.current = null
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null

    spokenMs.current = 0
    quietMs.current = 0
    phraseMs.current = 0
    levels.current = []
    setState('idle')

    if (flush && ws) {
      // Finalise the half-finished phrase and let the socket deliver it.
      // Closing immediately drops the last thing the rep said.
      ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }))
      socket.current = null
      setTimeout(() => ws.close(), 2500)
      return
    }

    ws?.close()
    socket.current = null
  }, [])

  const start = useCallback(async () => {
    setError(null)
    setState('connecting')
    pending.current = []

    try {
      const tokenRes = await fetch('/api/realtime-token', { method: 'POST' })
      if (!tokenRes.ok) {
        const body = (await tokenRes.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? 'Could not start voice input')
      }
      const { token } = (await tokenRes.json()) as { token: string }

      const media = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      })
      stream.current = media

      // GA realtime: the ephemeral secret rides the openai-insecure-api-key
      // subprotocol. The old openai-beta.realtime-v1 subprotocol routes to the
      // retired beta endpoint, which refuses the connection.
      const ws = new WebSocket('wss://api.openai.com/v1/realtime', [
        'realtime',
        `openai-insecure-api-key.${token}`,
      ])
      socket.current = ws

      ws.onopen = () => {
        const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
        audioCtx.current = ctx
        const source = ctx.createMediaStreamSource(media)
        const processor = ctx.createScriptProcessor(4096, 1, 1)
        node.current = processor

        processor.onaudioprocess = (event) => {
          if (ws.readyState !== WebSocket.OPEN) return
          const samples = event.inputBuffer.getChannelData(0)
          // Use the context's real rate: a browser may ignore the 24 kHz hint.
          const frameMs = (samples.length / ctx.sampleRate) * 1000

          ws.send(
            JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: floatToPcm16Base64(samples),
            }),
          )

          const level = rms(samples)
          const recent = levels.current
          recent.push(level)
          if (recent.length > FLOOR_WINDOW_FRAMES) recent.shift()
          const floor = Math.min(...recent)
          const speaking =
            level > LOUD ||
            (recent.length > CALIBRATION_FRAMES && level > Math.max(floor * SPEECH_FACTOR, MIN_FLOOR))

          const commit = () => {
            ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }))
            spokenMs.current = 0
            quietMs.current = 0
            phraseMs.current = 0
          }

          if (speaking) {
            quietMs.current = 0
            spokenMs.current += frameMs
            phraseMs.current += frameMs
            // A rep who never pauses must still get finalised text.
            if (phraseMs.current >= MAX_PHRASE_MS) commit()
          } else {
            quietMs.current += frameMs
            if (spokenMs.current > 0) phraseMs.current += frameMs
            if (quietMs.current >= SILENCE_MS && spokenMs.current >= MIN_PHRASE_MS) commit()
          }
        }

        source.connect(processor)
        processor.connect(ctx.destination)
        setState('listening')
      }

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data as string) as {
          type: string
          item_id?: string
          delta?: string
          transcript?: string
          error?: { message?: string }
        }

        if (msg.type === 'conversation.item.input_audio_transcription.delta' && msg.item_id) {
          const entry = pending.current.find((p) => p.id === msg.item_id)
          if (entry) entry.text += msg.delta ?? ''
          else pending.current.push({ id: msg.item_id, text: msg.delta ?? '' })
          emitLive()
        } else if (msg.type === 'conversation.item.input_audio_transcription.completed') {
          const idx = pending.current.findIndex((p) => p.id === msg.item_id)
          // Not pending means the rep discarded it by editing; drop it rather
          // than append a duplicate of text they already have.
          if (idx === -1) return
          pending.current.splice(idx, 1)
          const text = (msg.transcript ?? '').trim()
          if (text) onText(text)
          emitLive()
        } else if (msg.type === 'error') {
          setError(msg.error?.message ?? 'Voice input failed')
          setState('error')
        }
      }

      ws.onerror = () => {
        setError('Voice connection failed')
        setState('error')
      }

      ws.onclose = () => {
        if (socket.current) stop()
      }
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone permission denied'
          : err instanceof Error
            ? err.message
            : 'Could not start voice input'
      setError(message)
      setState('error')
      stop()
    }
  }, [onText, emitLive, stop])

  return {
    state,
    error,
    start,
    stop,
    discardPending,
    supported: typeof window !== 'undefined' && !!navigator.mediaDevices,
  }
}
