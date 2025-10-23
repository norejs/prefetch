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
            if (target === 'web') {
                // UMD 格式用于 importScripts
                return {
                    'prefetch-worker.umd': './src/setup.ts',
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
        targets: ['service-worker', 'node', 'web'],
        // UMD 格式配置
        distPath: {
            root: 'dist',
        },
        filename: {
            js: '[name].js',
        },
    },
    tools: {
        rspack: (config, { target }) => {
            if (target === 'web') {
                // 配置 UMD 输出
                config.output = config.output || {};
                config.output.library = {
                    name: 'PrefetchWorker',
                    type: 'umd',
                    export: 'default',
                };
                config.output.globalObject = 'self';
            }
            return config;
        },
    },
};
