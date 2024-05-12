export default {
  source: {
    entry({ target }) {
      if (target === 'service-worker') {
        return {
          index: './src/worker/index.ts',
        };
      }
      if (target === 'web') {
        return {
          index: './src/main/index.ts',
        };
      }
    },
  },
  dev: {
    writeToDisk: true,
  },
  server: {
    port: 9004,
    publicDir: {
      name: 'dist/worker/',
    },
  },
  output: {
    targets: ['service-worker', 'web'],
  },
};
