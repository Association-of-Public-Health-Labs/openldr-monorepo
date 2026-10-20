import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",   
    "../../packages/auth/**/*.{ts,tsx}", 
    "../../packages/auth/src/**/*.{ts,tsx}", 
    "../../packages/ai/**/*.{ts,tsx}",
    "../../packages/ai/src/**/*.{js,ts,jsx,tsx,mdx}",

    "../../packages/design_system/**/*.{ts,tsx}",
    "../../packages/design_system/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-open-sans)", "Inter", "sans-serif"],
      },
    },  
  },  
  plugins: [typography],
  darkMode: "class",
};

export default config;
