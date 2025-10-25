export default {
  source: {
    entry({ target }) {
      if (target === 'service-worker') {
        return {
          index: './src/index.ts',
          'service-worker': './src/index.ts',
        };
      }

      return {
        index: './src/index.server.ts',
      };

    },
  },
  dev: {
    writeToDisk: true,
  },
  server: {
    port: 18003,
    publicDir: {
      name: 'dist/worker/',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cross-Origin-Embedder-Policy': 'cross-origin',
      'Cross-Origin-Opener-Policy': 'cross-origin',
    },
  },
  output: {
    minify: false,
    targets: ['service-worker', 'node'],
    distPath: {
      root: 'dist',
    },
    filename: {
      js: '[name].js',
    },
  },
  tools: {
    rspack: (config: any, { target }: { target: string }) => {
      if (target === 'node') {
        // Node.js 环境下将 express 设为外部依赖
        config.externals = config.externals || {};
        config.externals.express = 'commonjs express';
      }

      return config;
    },
  },
};
