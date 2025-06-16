import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // If next-themes is used, it's good practice to add it here for older Next.js versions,
  // but usually not needed for latest versions with App Router.
  // However, since `useTheme` might be used, this is a safeguard.
  // transpilePackages: ['next-themes'], // This line can be commented out if next-themes isn't used or causes issues.
};

export default nextConfig;
