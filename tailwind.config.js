import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#22c55e",
        secondary: "#0f172a",
        background: "#f8fafc",
        muted: "#e2e8f0",
        border: "#cbd5e1",
        card: "#ffffff",
      },
    },
  },
  plugins: [],
};

export default config;


