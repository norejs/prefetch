const config = {
    source: {
        entry: {
            worker: './src/worker.js',
        },
    },
    output: {
        distPath: {
            root: 'dist-worker',
            js: '',
        },
        filename: {
            js: '[name].js',
        },
        targets: ['web-worker'],
    },
};
export default config;
