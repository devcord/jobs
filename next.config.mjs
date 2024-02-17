/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: '*.discordapp.com'},
      {protocol: 'https', hostname: '*.devcord.com'},
      {protocol: 'https', hostname: '*.cloudinary.com'},
    ]
  },
};

export default nextConfig;
