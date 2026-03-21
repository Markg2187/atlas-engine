import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Atlas Engine Design System
        "atlas-bg": "#0b1120",
        "atlas-surface": "#0f1a2e",
        "atlas-surface2": "#142035",
        "atlas-border": "#1e3055",
        "atlas-gold": "#e8c96e",
        "atlas-gold2": "#c9a84c",
        "atlas-text": "#ccd9ee",
        "atlas-text-dim": "#6e88b0",
        "atlas-success": "#54c7a2",
        "atlas-warning": "#e8b86d",
        "atlas-danger": "#e05a6a",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
