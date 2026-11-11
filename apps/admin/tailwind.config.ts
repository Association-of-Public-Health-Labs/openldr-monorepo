import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/auth/src/**/*.{ts,tsx}",
    "../../packages/design_system/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-open-sans)", "Inter", "sans-serif"],
      },
    },
  },
  darkMode: "class",
};

export default config;
