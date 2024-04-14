export default {
  source: {
    entry({ target }) {
      if (target === 'service-worker') {
        return {
          index: './src/message-worker.ts',
        };
      }
      if (target === 'web') {
        return {
          index: './src/message-main.ts',
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
    targets: ['service-worker', 'node'],
  },
};
