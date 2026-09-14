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

  const stop = useCallback(() => {
    node.current?.disconnect()
    node.current = null
    void audioCtx.current?.close().catch(() => {})
    audioCtx.current = null
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
    socket.current?.close()
    socket.current = null
    setPartial('')
    setState('idle')
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
          const pcm = floatToPcm16Base64(event.inputBuffer.getChannelData(0))
          ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: pcm }))
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
