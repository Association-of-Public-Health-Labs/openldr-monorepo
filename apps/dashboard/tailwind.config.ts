import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "../tb/app/**/*.{ts,tsx}",
    "../tb/components/**/*.{ts,tsx}",
    "../../packages/auth/**/*.{ts,tsx}",
    "../../packages/auth/src/**/*.{ts,tsx}",
    "../../packages/ai/**/*.{ts,tsx}",
    "../../packages/ai/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/design_system/**/*.{ts,tsx}",
    "../../packages/design_system/src/**/*.{ts,tsx}",
    "../../packages/design_system_mui/**/*.{ts,tsx}",
    "../../packages/design_system_mui/src/**/*.{ts,tsx}",
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
