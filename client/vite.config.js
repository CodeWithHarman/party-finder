import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Allows Firebase Google sign-in popup to communicate back
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
 