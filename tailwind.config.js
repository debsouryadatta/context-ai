/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './entrypoints/**/*.{js,jsx,ts,tsx,html}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
