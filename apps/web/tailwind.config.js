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
          bg:     "#020406",
          card:   "#070A0F",
          border: "#0F1620",
          muted:  "#6A8098",
          sub:    "#95ADBF",
          text:   "#DCE6F0",
          teal:   "#C4D4E4",
          navy:   "#0E1520",
        },
      },
      keyframes: {
        ambientPulse: {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.5" },
        },
        fadeSlideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "ambient-pulse": "ambientPulse 8s ease-in-out infinite",
        "fade-up":       "fadeSlideUp 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
