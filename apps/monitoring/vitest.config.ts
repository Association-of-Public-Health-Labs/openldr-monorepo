import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: fileURLToPath(new URL("./", import.meta.url)) },
      // Same as the tsconfig paths: deep imports into the design system's src.
      { find: /^server-only$/, replacement: fileURLToPath(new URL("./test/server-only-stub.ts", import.meta.url)) },
      { find: /^@repo\/design_system\/(.*)$/, replacement: fileURLToPath(new URL("../../packages/design_system/src/", import.meta.url)) + "$1" },
    ],
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
  },
});
