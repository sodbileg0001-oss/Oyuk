import type { Plugin } from 'vite'

/** Runs the very same Node handler locally, without an account or a mock success response. */
export function localApi(): Plugin {
  return {
    name: 'little-letter-local-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/submit-response', async (request, response) => {
        if ((request.url ?? '/').split('?')[0] !== '/') { response.statusCode = 404; response.end(); return }
        try {
          const { default: handler } = await server.ssrLoadModule('/api/submit-response.ts')
          await handler(request, response)
        } catch {
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({ ok: false, code: 'SERVER_ERROR', message: 'Жижигхэн саатал гарлаа. Дахин оролдоорой. ♡' }))
        }
      })
    },
  }
}
