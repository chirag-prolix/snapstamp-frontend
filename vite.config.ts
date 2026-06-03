import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const certsDir = path.resolve(__dirname, '../snapstamp/docker/nginx/certs')

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: 'snapstamp.local',
    port: 5173,
    https: {
      key:  fs.readFileSync(path.join(certsDir, 'snapstamp.local-key.pem')),
      cert: fs.readFileSync(path.join(certsDir, 'snapstamp.local.pem')),
    },
  },
})
