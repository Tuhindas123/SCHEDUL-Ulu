import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: './', // <-- Change this from '/flow-tracker/' to './'
  plugins: [react()], // or vue(), etc.
})