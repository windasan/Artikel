/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
     {
        protocol: 'https',
        hostname: 'kyavowffztigyoprjqhw.supabase.co',
        pathname: '**',
      },
    ],
  },
}

module.exports = nextConfig