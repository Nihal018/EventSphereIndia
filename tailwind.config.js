/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        accent: {
          50: "#fef7ee",
          100: "#fdedd3",
          200: "#fbd8a5",
          300: "#f9bc6d",
          400: "#f69332",
          500: "#f37316",
          600: "#e85d04",
          700: "#c14706",
          800: "#9a3a0c",
          900: "#7c2d0c",
        },
        background: "#fafafa",
      },
    },
  },
  plugins: [],
};
