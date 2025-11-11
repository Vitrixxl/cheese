import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const projectRoot = resolve('.')
const rendererRoot = resolve('src/renderer')
const rendererSrcRoot = resolve('src/renderer/src')
const rendererPublicRoot = resolve('src/renderer/public')
const sharedRoot = resolve('../shared')
const backendRoot = resolve('../backend/src')
const gameServerRoot = resolve('../game-server/src')

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: rendererRoot,
    publicDir: rendererPublicRoot,
    resolve: {
      alias: {
        '@': rendererSrcRoot,
        '@shared': sharedRoot,
        '@backend': backendRoot,
        '@game-server': gameServerRoot
      }
    },
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']]
        }
      }),
      tailwindcss()
    ],
    server: {
      fs: {
        allow: [
          projectRoot,
          rendererRoot,
          rendererSrcRoot,
          rendererPublicRoot,
          sharedRoot,
          backendRoot,
          gameServerRoot
        ]
      }
    }
  }
})
