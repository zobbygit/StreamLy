/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    // "xs" isn't a default Tailwind breakpoint — added here since ControlBar.jsx
    // uses xs: to swap "End Meeting" -> "End" below the sm breakpoint.
    screens: {
      xs: "420px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // "ink", muted, line, and surface-base are CSS-variable-backed (see
        // index.css :root / .dark) so toggling the "dark" class on <html>
        // retints every light-app page's primary text, secondary text,
        // borders, and page background at once. "midnight-navy" is kept as
        // a FIXED literal color (not swappable) because it's also used as
        // a background on the always-dark meeting room and admin panel
        // surfaces, which must stay dark navy regardless of the app-wide
        // light/dark toggle — swapping it would break those.
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        "surface-base": "rgb(var(--color-surface-base) / <alpha-value>)",
        "midnight-navy": "#07111F",
        // Brand/accent colors stay fixed — they're chosen to read fine on
        // both a light and a dark background.
        "electric-blue": "#2563EB",
        "royal-blue": "#3B82F6",
        cyan: "#06B6D4",
        violet: "#7C3AED",
      },
      backgroundImage: {
        "streamly-gradient": "linear-gradient(135deg, #2563EB 0%, #06B6D4 55%, #7C3AED 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(7, 17, 31, 0.08)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};