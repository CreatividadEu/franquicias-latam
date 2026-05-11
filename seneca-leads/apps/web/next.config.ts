import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // @seneca/db and @seneca/shared are workspace packages; let Next transpile them
  transpilePackages: ['@seneca/db', '@seneca/shared'],
  // Note: previously had outputFileTracingRoot pointed at the workspace
  // root to silence Vercel's multiple-lockfile warning, but it confuses
  // the `vercel build` CLI which expects .next/ relative to apps/web/.
  // The warning is cosmetic; trade we made for clean CLI deploys.
  experimental: {
    // serverActions is on by default in Next 15
  },
  poweredByHeader: false,
};

export default nextConfig;
