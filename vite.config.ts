import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'API_')

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      proxy: Object.fromEntries(
        ['/auth', '/invitations', '/connections', '/graph', '/search', '/health'].map((path) => [path, {
          target: env.API_BASE_URL,
          changeOrigin: true,
        }]),
      ),
    },
  }
})
