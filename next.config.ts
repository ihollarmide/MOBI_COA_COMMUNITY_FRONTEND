import type { NextConfig } from "next";
import { v4 as uuidv4 } from "uuid";

const nextConfig: NextConfig = {
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === "production",
  // },
  generateBuildId: async () => {
    return uuidv4(); // or use commit SHA
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.placeholder.com",
      },
    ],

    formats: ["image/avif", "image/webp"],
  },
  /* config options here */
  webpack(config, { dev, isServer }) {
    // ✅ Fix unsafe-eval by changing source maps
    if (dev) {
      config.devtool = "source-map";
      // alternatives: "cheap-module-source-map", "inline-source-map"
      // all avoid "eval" usage
    }

    config.module.rules.push({
      test: /\.svg$/i,
      use: ["@svgr/webpack"],
    });
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/welcome",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
