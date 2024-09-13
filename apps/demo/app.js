const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 4000;

// 目标域名，可以通过环境变量设置
const TARGET_DOMAIN = process.env.TARGET_DOMAIN || 'https://ct.ctrip.com/';

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'static')));

// 创建代理中间件
const proxyMiddleware = createProxyMiddleware({
    target: TARGET_DOMAIN,
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/' // 如果需要，可以重写路径
    },
    onProxyRes: (proxyRes, req, res) => {
        // 添加 CORS 头
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
});

// 对除了静态文件外的所有请求使用代理
// app.use((req, res, next) => {
//     if (!req.url.startsWith('/static/')) {
//         return proxyMiddleware(req, res, next);
//     }
//     next();
// });

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Proxying requests to ${TARGET_DOMAIN}`);
});