import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",   
    "../../packages/ui/**/*.{ts,tsx}", 
    "../../packages/auth/**/*.{ts,tsx}", 
    "../../packages/auth/src/**/*.{ts,tsx}", 
    "../../packages/auth-v2/**/*.{ts,tsx}", 
    "../../packages/auth-v2/**/*.{ts,tsx}", 
    "../../packages/ai/**/*.{ts,tsx}",
    "../../packages/ai/src/**/*.{js,ts,jsx,tsx,mdx}",

  ],
  theme: {
    extend: {},  
  },  
  plugins: [],
};

export default config;
