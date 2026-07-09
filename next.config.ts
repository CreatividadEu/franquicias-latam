import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Serve the empresarios funnel at the franquiciar. subdomain by rewriting
  // its root to /franquiciar — the URL bar keeps showing the subdomain (no
  // redirect). The subdomain must be attached to this Vercel project and
  // pointed at it in DNS before this takes effect.
  async rewrites() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "franquiciar.franquiciaslatam.com" }],
        destination: "/franquiciar",
      },
      {
        source: "/",
        has: [{ type: "host", value: "www.franquiciar.franquiciaslatam.com" }],
        destination: "/franquiciar",
      },
    ];
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
