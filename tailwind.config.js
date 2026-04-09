/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1", // Indigo
        secondary: "#10b981", // Emerald
        accent: "#f59e0b", // Amber
        background: "#0f172a", // Slate 900
        surface: "#1e293b", // Slate 800
      },
    },
  },
  plugins: [],
}
