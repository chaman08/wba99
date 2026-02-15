/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        primary: {
          DEFAULT: "var(--color-primary)",
          subtle: "var(--color-primary-subtle)",
        },
        secondary: "var(--color-secondary)",
        success: "var(--color-success)",
        error: "var(--color-error)",
        text: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
        },
        accent: "var(--color-accent)",
      },
      borderRadius: {
        "2xl": "1.25rem",
      },
      boxShadow: {
        "soft-light": "0 10px 50px rgba(15, 23, 42, 0.35)",
        "glass-dark": "0 4px 30px rgba(15, 23, 42, 0.35)",
      },
      transitionDuration: {
        250: "250ms",
      },
    },
  },
  plugins: [],
}
