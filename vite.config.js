import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // If Cloudflare is building, use '/', otherwise use GitHub's sub-folder path
  base: process.env.CF_PAGES ? '/' : '/flow-tracker/', 
})