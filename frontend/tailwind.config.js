/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Adjust the paths if needed
  theme: {
    extend: {
      colors: {
        customBlue: "#124E66",
        customGray: "#2E3944",
      },
    },
  },
  plugins: [],
};
