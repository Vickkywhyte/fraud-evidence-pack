import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/fraud-evidence-pack/',
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash:16].js',
      },
    },
  },
})
