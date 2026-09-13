import type { Plugin, ViteDevServer } from 'vite'

/**
 * Serves the `api/*.ts` Vercel functions from the Vite dev server.
 *
 * Without this, `npm run dev` 404s on /api/ocr and /api/realtime-token — the
 * functions only exist once deployed — so card capture and voice notes can
 * only be tested in production. The handlers use the Web Request/Response
 * signature, which is what Vercel's node runtime gives them, so dev and prod
 * run the same code.
 */
export function apiPlugin(): Plugin {
  return {
    name: 'local-vercel-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ''
        if (!url.startsWith('/api/')) return next()

        const name = url.split('?')[0].replace(/^\/api\//, '')
        if (!/^[a-z0-9-]+$/i.test(name)) return next()

        try {
          const mod = (await server.ssrLoadModule(`/api/${name}.ts`)) as {
            default?: (request: Request) => Promise<Response>
          }
          if (!mod.default) return next()

          const body = await new Promise<Buffer>((resolve) => {
            const chunks: Buffer[] = []
            req.on('data', (c: Buffer) => chunks.push(c))
            req.on('end', () => resolve(Buffer.concat(chunks)))
          })

          const request = new Request(`http://localhost${url}`, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body:
              req.method === 'GET' || req.method === 'HEAD'
                ? undefined
                : new Uint8Array(body),
          })

          const response = await mod.default(request)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          // A broken handler should show up as a 500 with the reason, not as a
          // silent fall-through to the SPA's index.html.
          console.error(`[api] ${name} failed`, error)
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Handler failed' }))
        }
      })
    },
  }
}
