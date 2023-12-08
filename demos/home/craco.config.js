module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            const oneOf = webpackConfig.module.rules[1]['oneOf'];
            // 增加到第一个
            oneOf.push({
                test: /\.tpl$/,
                use: { loader: 'raw-loader' },
            });
            oneOf.unshift({
                test: /\.tpl$/,
                use: { loader: 'raw-loader' },
            });
            console.log('webpackConfig', oneOf);
            // throw new Error('webpackConfig');
            return webpackConfig;
        },
    },
    devServer: {
        headers: {
            'Service-Worker-Allowed': '/',
        },
    },
};
