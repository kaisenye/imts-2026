// Mints a short-lived client secret for a realtime transcription session.
// The browser needs a credential to open the WebSocket, but it must never see
// OPENAI_API_KEY — so the key stays here and the browser gets a token that
// expires in a minute.

export const config = { runtime: 'nodejs' }

const SESSION = {
  session: {
    type: 'transcription',
    audio: {
      input: {
        format: { type: 'audio/pcm', rate: 24000 },
        transcription: {
          model: 'gpt-live-transcribe',
          // Both languages are hinted rather than one being forced: a rep
          // switches between them mid-sentence at a trade show.
          languages: ['en', 'zh'],
          delay: 'low',
        },
        turn_detection: { type: 'server_vad', silence_duration_ms: 700 },
      },
    },
  },
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Voice input is not configured' }, { status: 501 })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(SESSION),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('realtime token error', response.status, detail)
      return Response.json({ error: 'Could not start voice input' }, { status: 502 })
    }

    const payload = (await response.json()) as { value?: string; expires_at?: number }
    if (!payload.value) {
      return Response.json({ error: 'No client secret returned' }, { status: 502 })
    }

    return Response.json({ token: payload.value, expires_at: payload.expires_at })
  } catch (error) {
    console.error('realtime token failed', error)
    return Response.json({ error: 'Could not start voice input' }, { status: 502 })
  }
}
