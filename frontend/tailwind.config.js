/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        customBlue: "#124E66",
        customGray: "#2E3944",
        brand: {
          50:  "#eef4ff",
          100: "#dce9ff",
          200: "#b9d4ff",
          300: "#7eb3ff",
          400: "#3b87ff",
          500: "#1a63f5",
          600: "#0d47e2",
          700: "#0d38b7",
          800: "#112f92",
          900: "#142c74",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
