import { appTools, defineConfig } from '@modern-js/app-tools';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
  },
  output: {},
  dev: {
    port: 9000,
    assetPrefix: '/prefetch-demo/',
  },
  server: {
    // 所有生成的路由前面都会自动加上前缀 `/base`
    // 生成的服务端路由文件路径：dist/route.json
    baseUrl: '/prefetch-demo',
  },
  plugins: [
    appTools({
      bundler: 'webpack', // Set to 'experimental-rspack' to enable rspack ⚡️🦀
    }),
  ],
});
