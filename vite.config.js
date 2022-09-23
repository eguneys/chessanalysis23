import { resolve } from 'path'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    solidPlugin({ hot: false }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Chessanalysis23',
      fileName: 'chessanalysis23'
    },
    rollupOptions: {
      external: ['solid-js', 'solid-play']
    }
  },
})
