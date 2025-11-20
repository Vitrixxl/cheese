import type { Config } from "tailwindcss";

// Tailwind v4 still accepts a config file; we keep it minimal for the shadcn CLI.
export default {
  content: ["./src/renderer/src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
