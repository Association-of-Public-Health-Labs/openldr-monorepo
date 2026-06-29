import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/design_system", "@repo/design_system_mui", "@repo/utilities"],
};

export default nextConfig;
