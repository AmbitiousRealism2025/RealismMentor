/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Placeholder colors based on blueprint
        'brand-blue': '#007bff', // Example blue
        'brand-white': '#ffffff',
        'brand-green': '#28a745', // Example green
      },
    },
  },
  plugins: [],
};
