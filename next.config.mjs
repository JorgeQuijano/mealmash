/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'owmwdsypvvaxsckflbxx.supabase.co',
      },
    ],
  },
};

export default nextConfig;
