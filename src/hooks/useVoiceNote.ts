import { useCallback, useRef, useState } from 'react'

/**
 * Streaming dictation for the note box, via OpenAI realtime transcription.
 *
 * A rep is standing in a loud hall holding a coffee — typing a note is the
 * thing that does not happen, so the note gets lost. Speech arrives as partial
 * text while they talk and is committed when they stop.
 *
 * Audio is captured at 24 kHz mono PCM16, which is what the session expects.
 */

export type VoiceState = 'idle' | 'connecting' | 'listening' | 'error'

const SAMPLE_RATE = 24000

// gpt-live-transcribe does not support server-side turn detection, so the
// client decides where a phrase ends and commits the buffer itself. Without a
// commit the API never emits a completed transcript and nothing reaches the
// note box.
const SILENCE_RMS = 0.012
const SILENCE_MS = 800
const MIN_PHRASE_MS = 400

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
  /** Called with committed text each time a phrase finishes. */
  onText: (text: string) => void
}

export function useVoiceNote({ onText }: Options) {
  const [state, setState] = useState<VoiceState>('idle')
  const [partial, setPartial] = useState('')
  const [error, setError] = useState<string | null>(null)

  const socket = useRef<WebSocket | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const audioCtx = useRef<AudioContext | null>(null)
  const node = useRef<ScriptProcessorNode | null>(null)
  // Audio buffered since the last commit, and how long we have heard silence.
  const spokenMs = useRef(0)
  const quietMs = useRef(0)

  const stop = useCallback(() => {
    const ws = socket.current
    const pending = ws?.readyState === WebSocket.OPEN && spokenMs.current >= MIN_PHRASE_MS

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
    setPartial('')
    setState('idle')

    if (pending && ws) {
      // Flush the half-finished phrase and give the socket a moment to deliver
      // the transcript. Closing immediately drops the last thing the rep said.
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
      // subprotocol. Sending openai-beta.realtime-v1 routes to the retired beta
      // endpoint, which now refuses the connection.
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
          const frameMs = (samples.length / SAMPLE_RATE) * 1000

          ws.send(
            JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: floatToPcm16Base64(samples),
            }),
          )

          // Commit on a pause so text lands while the rep is still talking,
          // rather than all at once when they finally stop.
          if (rms(samples) < SILENCE_RMS) {
            quietMs.current += frameMs
            if (quietMs.current >= SILENCE_MS && spokenMs.current >= MIN_PHRASE_MS) {
              ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }))
              spokenMs.current = 0
              quietMs.current = 0
            }
          } else {
            quietMs.current = 0
            spokenMs.current += frameMs
          }
        }

        source.connect(processor)
        processor.connect(ctx.destination)
        setState('listening')
      }

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data as string) as {
          type: string
          delta?: string
          transcript?: string
          error?: { message?: string }
        }

        if (msg.type === 'conversation.item.input_audio_transcription.delta') {
          setPartial((prev) => prev + (msg.delta ?? ''))
        } else if (msg.type === 'conversation.item.input_audio_transcription.completed') {
          const text = (msg.transcript ?? '').trim()
          if (text) onText(text)
          setPartial('')
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
  }, [onText, stop])

  return { state, partial, error, start, stop, supported: typeof window !== 'undefined' && !!navigator.mediaDevices }
}
