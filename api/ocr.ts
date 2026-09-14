// Vercel serverless function: business card image URL -> parsed fields.
// Requires OPENAI_API_KEY. Never called with the key client-side.

const PROMPT = `Extract contact details from this business card image.
Return ONLY a JSON object with these exact keys: name, title, company, email, email2, phone, phone2.
Cards often carry two phone numbers (office and mobile) or two email addresses: put the
first in email/phone and the second in email2/phone2.
Use null for any field not present on the card. Do not guess or invent values.`

// Vision on a 1600px card can run past the default function timeout.
export const config = { maxDuration: 30 }

async function ocr(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'OCR is not configured' }, { status: 501 })
  }

  let imageUrl: string
  try {
    const body = (await request.json()) as { imageUrl?: string }
    if (!body.imageUrl) throw new Error('imageUrl is required')
    imageUrl = body.imageUrl
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: PROMPT },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('OpenAI error', response.status, detail)
      return Response.json({ error: 'Could not read the card' }, { status: 502 })
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = payload.choices?.[0]?.message?.content
    if (!content) return Response.json({ error: 'Empty response' }, { status: 502 })

    const parsed = JSON.parse(content) as Record<string, unknown>
    return Response.json({
      name: parsed.name ?? null,
      title: parsed.title ?? null,
      company: parsed.company ?? null,
      email: parsed.email ?? null,
      email2: parsed.email2 ?? null,
      phone: parsed.phone ?? null,
      phone2: parsed.phone2 ?? null,
    })
  } catch (error) {
    console.error('OCR failed', error)
    return Response.json({ error: 'Could not read the card' }, { status: 502 })
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

export default adapt(ocr)
