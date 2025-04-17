const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "app"), // Yeh line ADD karni hai
    };
    return config;
  },
};

module.exports = nextConfig;
