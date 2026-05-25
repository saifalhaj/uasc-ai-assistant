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
          bg: "#111111",
          card: "#1A1A1A",
          border: "#2A2A2A",
          muted: "#555555",
          sub: "#888888",
          text: "#E0E0E0",
        },
      },
    },
  },
  plugins: [],
};
