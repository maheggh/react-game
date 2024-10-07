/** @type {import('tailwindcss').Config} */
import plugin from "tailwindcss/plugin";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: "class",
  content: [
    "./index.html",                       // This should point to your public index.html file
    "./src/**/*.{js,ts,jsx,tsx}",         // This ensures Tailwind scans all files in src folder
    "./public/assets/**/*.{js,ts,jsx,tsx}", // Assets if you're adding Tailwind classes here
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff79c6',
      },
      fontFamily: {
        // Your font configuration
      },
    },
  },
  plugins: [
    plugin(function ({ addBase, addComponents, addUtilities }) {
      addBase({});
      addComponents({
        ".container": {
          "@apply max-w-[77.5rem] mx-auto px-5 md:px-10 xl:max-w-[87.5rem]": {},
        },
        // Other components...
      });
      addUtilities({
        ".tap-highlight-color": {
          "-webkit-tap-highlight-color": "rgba(0, 0, 0, 0)",
        },
      });
    }),
  ],
};
