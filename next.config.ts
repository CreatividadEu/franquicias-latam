import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Redirect the country vanity domains to their market sections. Each rule
  // fires only when the request Host matches, so they have no effect on the
  // primary franquiciaslatam.com domain. Each domain must be attached to this
  // Vercel project (see deploy notes).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "franquiciascolombia.com" }],
        destination: "https://franquiciaslatam.com/co",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.franquiciascolombia.com" }],
        destination: "https://franquiciaslatam.com/co",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "franquiciasecuador.com" }],
        destination: "https://franquiciaslatam.com/ec",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.franquiciasecuador.com" }],
        destination: "https://franquiciaslatam.com/ec",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
