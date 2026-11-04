import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vite uporablja Reactov vtičnik za razvojni strežnik in izdelavo aplikacije.
export default defineConfig({
  plugins: [react()],
})
