/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F2A1D",
        darkGreen: "#375534",
        light: "#E3EED4",
        accent: "#AEC3B0",
        secondary: "#6B9071",
        success: "#10B981",
        neutral: "#6B7280",
      },
    },
  },
  plugins: [],
}


