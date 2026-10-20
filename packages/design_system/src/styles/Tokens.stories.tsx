import type { Meta, StoryObj } from "@storybook/react-vite";

const TOKENS = [
  "primary", "primary-foreground", "background", "foreground", "card", "muted", "muted-foreground",
  "border", "accent", "destructive", "warning", "success", "info", "ring", "sidebar", "sidebar-primary",
  "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6", "chart-7", "chart-8",
];

function TokenPage() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {TOKENS.map((token) => (
        <div key={token} className="rounded-lg border p-2 text-xs">
          <div className="mb-2 h-12 rounded-md border" style={{ background: `var(--${token})` }} />
          <code>--{token}</code>
        </div>
      ))}
    </div>
  );
}

const meta: Meta<typeof TokenPage> = { title: "Foundations/Tokens", component: TokenPage };
export default meta;

/** Switch VL/TB and light/dark from the toolbar. */
export const Tokens: StoryObj<typeof TokenPage> = {};
