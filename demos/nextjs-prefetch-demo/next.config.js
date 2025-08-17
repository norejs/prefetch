/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // 允许外部域名的图片
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placeholder.co',
      },
    ],
  },
  // 自定义 webpack 配置，确保 service worker 可以正常工作
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
