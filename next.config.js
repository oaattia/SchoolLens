/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produce a self-contained server bundle in `.next/standalone` so the
  // production image doesn't need node_modules. Required for the Docker
  // deployment. See HOSTING.md.
  output: "standalone",
};

module.exports = nextConfig;