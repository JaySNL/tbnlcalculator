import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for assets
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Split HeroUI and Framer Motion (large UI libs)
            if (id.includes('@heroui') || id.includes('framer-motion')) {
              return 'vendor-ui';
            }
            // Keep React and others in a common vendor chunk to avoid circular deps
            return 'vendor-core';
          }
        },
        entryFileNames: 'assets/calculator.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/calculator.[ext]',
      },
    },
    cssCodeSplit: false, // Put all CSS in one file
  },
})
