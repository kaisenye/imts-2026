import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { apiPlugin } from './vite-api-plugin'

export default defineConfig(({ mode }) => {
  // The api/ handlers read process.env; Vite only exposes VITE_* to the client,
  // so load the rest into process.env for the dev-server middleware.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
  }
})
