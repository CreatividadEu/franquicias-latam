import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // @seneca/db and @seneca/shared are workspace packages; let Next transpile them
  transpilePackages: ['@seneca/db', '@seneca/shared'],
  // Pin the file-tracing root to the seneca-leads pnpm workspace so Next
  // doesn't get confused by the parent franquicias-latam npm lockfile.
  outputFileTracingRoot: path.join(__dirname, '..', '..'),
  experimental: {
    // serverActions is on by default in Next 15
  },
  poweredByHeader: false,
};

export default nextConfig;
