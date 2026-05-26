/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // surfaces
        'bg-base':     '#0a0d12',
        'bg-deep':     '#0f1419',
        'surf-1':      '#161b22',
        'surf-2':      '#1c2128',
        'surf-3':      '#232932',
        // borders
        'border-base': '#2a3038',
        'border-hi':   '#3a4250',
        'border-bri':  '#6e7681',
        // text
        'text-hi':     '#f0f3f6',
        'text-mid':    '#b8c0c8',
        'text-dim':    '#6e7681',
        'text-faint':  '#4a5058',
        // functional
        'uasc-red':    '#d97570',
        'uasc-amber':  '#d8a957',
        'uasc-green':  '#7aae7a',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        ar:   ['var(--font-ar)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:      '3px',
        DEFAULT: '4px',
        md:      '4px',
        lg:      '6px',
      },
      letterSpacing: {
        wider:   '0.06em',
        widest:  '0.1em',
      },
      keyframes: {
        'pulse-soft': {
          '0%':   { boxShadow: '0 0 0 0 rgba(122,174,122,0.6)' },
          '70%':  { boxShadow: '0 0 0 5px rgba(122,174,122,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(122,174,122,0)' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.8s infinite',
      },
    },
  },
  plugins: [],
};
