// Mints a short-lived client secret for a realtime transcription session.
// The browser needs a credential to open the WebSocket, but it must never see
// OPENAI_API_KEY — so the key stays here and the browser gets a token that
// expires in a minute.

// gpt-live-transcribe rejects turn_detection entirely — even set to null — and
// segments speech itself, emitting one completed transcript per phrase.
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
      },
    },
  },
}

async function realtimeToken(request: Request): Promise<Response> {
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

// --- Vercel adapter ---------------------------------------------------------
// Vercel's Node runtime invokes functions as (req, res) and ignores a returned
// Response; without this every call hung until the platform timeout. Kept
// inline rather than imported: a sibling module in api/ is deployed as its own
// endpoint, and an extension-less ESM import is one more thing to fail at load.
// Any throw is reported as JSON so a failure is diagnosable from the client.
import type { IncomingMessage, ServerResponse } from 'node:http'

type NodeRequest = IncomingMessage & { body?: unknown }

async function nodeBody(req: NodeRequest): Promise<BodyInit | undefined> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') return req.body
    if (Buffer.isBuffer(req.body)) return new Uint8Array(req.body)
    return JSON.stringify(req.body)
  }
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return chunks.length ? new Uint8Array(Buffer.concat(chunks)) : undefined
}

function toRequest(req: NodeRequest, body: BodyInit | undefined): Request {
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue
    headers.set(key, Array.isArray(value) ? value.join(', ') : value)
  }
  const method = req.method ?? 'GET'
  return new Request(`https://${req.headers.host ?? 'localhost'}${req.url ?? '/'}`, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : body,
  })
}

function adapt(handler: (request: Request) => Promise<Response>) {
  return async function serve(req: Request | NodeRequest, res?: ServerResponse): Promise<Response | void> {
    if (!res || typeof (req as Request).text === 'function') return handler(req as Request)
    const node = req as NodeRequest
    try {
      const response = await handler(toRequest(node, await nodeBody(node)))
      res.statusCode = response.status
      response.headers.forEach((value, key) => res.setHeader(key, value))
      res.end(Buffer.from(await response.arrayBuffer()))
    } catch (error) {
      const err = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) }
      res.statusCode = 500
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ error: 'adapter', ...err }))
    }
  }
}
// ---------------------------------------------------------------------------

export default adapt(realtimeToken)
