import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: "out/main",
      lib: {
        entry: path.resolve(__dirname, "src/main/main.ts"),
        formats: ["cjs"],
        fileName: () => "main.js"
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: "out/preload",
      lib: {
        entry: path.resolve(__dirname, "src/preload/preload.ts"),
        formats: ["cjs"],
        fileName: () => "preload.js"
      }
    }
  },
  renderer: {
    root: path.resolve(__dirname, "src/renderer"),
    plugins: [react()],
    build: {
      outDir: path.resolve(__dirname, "dist/renderer"),
      emptyOutDir: true
    },
    server: {
      port: 5173,
      strictPort: true
    }
  }
});
