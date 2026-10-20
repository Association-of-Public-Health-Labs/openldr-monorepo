// import { dirname } from "path";
// import { fileURLToPath } from "url";
// import { FlatCompat } from "@eslint/eslintrc";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// const eslintConfig = [
//   ...compat.extends("next/core-web-vitals", "next/typescript"),
// ];

// export default eslintConfig;

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extend the default Next.js and TypeScript rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ✅ Add rule overrides for TS files
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Apps import shared UI only from @repo/design_system (platform spec §5.4).
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@repo/design_system_mui", "@repo/design_system_mui/*", "**/design_system_mui/**"],
          message: "Import from @repo/design_system instead.",
        }],
      }],
      // Warning until wave 2f removes MUI from the apps.
      "@typescript-eslint/no-restricted-imports": ["warn", {
        patterns: [{ group: ["@mui/*"], message: "MUI is being removed; use @repo/design_system." }],
      }],
    },
  },
];

export default eslintConfig;
