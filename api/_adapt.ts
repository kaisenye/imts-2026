import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Lets a Web-signature handler `(Request) => Response` run under Vercel's
 * Node runtime, which invokes functions as `(req, res)` and ignores the
 * return value. Deployed as-is, our handlers returned a Response nobody
 * wrote to `res`, so every /api call hung until the platform timeout and
 * card OCR sat on "Reading card…" forever.
 *
 * With no `res` argument (the Vite dev middleware, or a runtime that does
 * pass a Request) the handler is called straight through.
 */

type WebHandler = (request: Request) => Promise<Response>
type NodeRequest = IncomingMessage & { body?: unknown }

function toRequest(req: NodeRequest, body: BodyInit | undefined): Request {
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue
    headers.set(key, Array.isArray(value) ? value.join(', ') : value)
  }
  const host = req.headers.host ?? 'localhost'
  const method = req.method ?? 'GET'
  return new Request(`https://${host}${req.url ?? '/'}`, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : body,
  })
}

async function readBody(req: NodeRequest): Promise<BodyInit | undefined> {
  // Vercel has usually parsed the body already by content-type; if so the
  // stream is spent and req.body is what we have.
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') return req.body
    if (Buffer.isBuffer(req.body)) return new Uint8Array(req.body)
    return JSON.stringify(req.body)
  }
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return chunks.length ? new Uint8Array(Buffer.concat(chunks)) : undefined
}

export function adapt(handler: WebHandler) {
  return async function serve(
    req: Request | NodeRequest,
    res?: ServerResponse,
  ): Promise<Response | void> {
    if (!res || typeof (req as Request).text === 'function') {
      return handler(req as Request)
    }

    const node = req as NodeRequest
    const response = await handler(toRequest(node, await readBody(node)))
    res.statusCode = response.status
    response.headers.forEach((value, key) => res.setHeader(key, value))
    res.end(Buffer.from(await response.arrayBuffer()))
  }
}
