/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cloud.appwrite.io",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "developers.google.com",
        port: "",
        pathname: "**",
      },
    ],
  },
};
export default nextConfig;
