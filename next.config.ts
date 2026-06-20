import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Redirect the Colombia vanity domain to the /co market section. Fires only
  // when the request Host is franquiciascolombia.com (or its www), so it has no
  // effect on the primary franquiciaslatam.com domain. Requires the domain to
  // be attached to this Vercel project (see deploy notes).
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
    ];
  },
};

export default nextConfig;
