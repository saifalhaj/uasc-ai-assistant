/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        uasc: {
          navy: "#1B2A4A",
          gold: "#C9A84C",
          light: "#F5F7FA",
          dark: "#020617",
          card: "#0F172A",
          border: "#1E293B",
        },
      },
    },
  },
  plugins: [],
};
