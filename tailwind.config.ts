import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sidebar: '#0a1628',
        surface: '#f0f4f8',
        card: '#ffffff',
        border: '#e2e8f0',
        accent: '#0066cc',
        'accent-hover': '#0052a3',
        teal: '#00d4aa',
        'text-primary': '#1e293b',
        'text-secondary': '#64748b',
        'text-muted': '#94a3b8',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
}
export default config
