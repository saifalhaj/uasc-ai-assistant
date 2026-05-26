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
          bg:     "#05070A",
          card:   "#0E141B",
          border: "#162030",
          muted:  "#506A82",
          sub:    "#7A98B5",
          text:   "#C8D6E5",
          teal:   "#00C9B1",
          navy:   "#0F2D4A",
        },
      },
      keyframes: {
        ambientPulse: {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.55" },
        },
        fadeSlideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "ambient-pulse": "ambientPulse 7s ease-in-out infinite",
        "fade-up":       "fadeSlideUp 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
