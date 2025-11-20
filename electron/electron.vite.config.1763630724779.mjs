// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
var projectRoot = resolve(".");
var rendererRoot = resolve("src/renderer");
var rendererSrcRoot = resolve("src/renderer/src");
var rendererPublicRoot = resolve("src/renderer/public");
var sharedRoot = resolve("../shared/src");
var backendRoot = resolve("../backend/src");
var gameServerRoot = resolve("../game-server/src");
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: rendererRoot,
    publicDir: rendererPublicRoot,
    build: {
      target: "esnext"
    },
    resolve: {
      alias: {
        "@": rendererSrcRoot,
        "@shared": sharedRoot,
        "@backend": backendRoot,
        "@game-server": gameServerRoot
      }
    },
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]]
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
});
export {
  electron_vite_config_default as default
};
