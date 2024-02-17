/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "res.cloudinary.com", "cdn.discordapp.com", "jobs.devcord.com", "devcord.com"],
  },
};

export default nextConfig;
