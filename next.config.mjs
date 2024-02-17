/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "res.cloudinary.com", "cdn.discordapp.com"],
  },
};

export default nextConfig;
