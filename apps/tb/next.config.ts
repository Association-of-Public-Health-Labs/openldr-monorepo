import type { NextConfig } from "next";
import createMDX from '@next/mdx';

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb"
    }
  },
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  // Add Turbopack configuration for MDX
  turbopack: {
    rules: {
      '*.mdx': {
        loaders: ['@mdx-js/loader'],
        as: '*.js',
      },
    },
  },
};

export default withMDX(nextConfig);