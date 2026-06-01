import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: !process.env.VERCEL,
  tanstackStart: {
    // نتركها فارغة، وسيقوم lovalbe.dev بالتوافق مع بيئة النشر تلقائياً
  },
  vite: {
    build: {
      outDir: "dist",
    },
  },
});