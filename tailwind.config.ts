import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        rbgen: {
          dark: "#0e0b06",
          gold: "#c9942a",
          "gold-bright": "#e8b84b",
          parchment: "#f9f4e8",
          rust: "#7a2e10",
          brown: "#4a3f2f",
        },
      },
    },
  },
  plugins: [],
};
export default config;
