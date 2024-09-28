/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "canny-hippopotamus-570.convex.site",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default config;
