import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tailwindcss from "@tailwindcss/vite"
import path from "path"


// https://vite.dev/config/
export default defineConfig({
  plugins: [react() , tailwindcss() , wasm() , nodePolyfills()],
   resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
