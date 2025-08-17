export default {
    source: {
        entry({ target }) {
            if (target === 'service-worker') {
                return {
                    index: './src/index.ts',
                    'service-worker': './src/index.ts',
                };
            }
            if (target === 'node') {
                return {
                    index: './src/index.server.ts',
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
        minify: false,
        targets: ['service-worker', 'node'],
    },
};
