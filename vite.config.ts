import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { localApi } from './server/local-api'

export default defineConfig(({ mode, command }) => {
  if (command === 'serve') {
    const local = loadEnv(mode, process.cwd(), '')
    for (const key of ['RESEND_API_KEY', 'NOTIFICATION_EMAIL', 'FROM_EMAIL', 'SITE_URL']) {
      if (process.env[key] === undefined && local[key]) process.env[key] = local[key]
    }
  }
  return { plugins: [react(), localApi()] }
})
