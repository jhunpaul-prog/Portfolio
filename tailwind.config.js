/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#38bdf8",
        brandDark: "#0284c7",
        surface: "#0b0f19",
        card: "#111827",
        cardBorder: "#1f2937",
      },
    },
  },
  plugins: [],
};
