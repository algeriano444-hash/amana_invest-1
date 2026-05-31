import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
  },
  vite: {
    build: {
      outDir: "dist",
    },
  },
});