import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: '#E4E4E7', // define corretamente a cor usada por `border-border`
        background: '#FAFAFA',
        primary: '#0F172A',
        secondary: '#1E293B',
      },
    },
  },
  plugins: [],
}

export default config
