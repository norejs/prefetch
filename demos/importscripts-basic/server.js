#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.md': 'text/markdown'
};

// 获取文件的MIME类型
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'text/plain';
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // 安全检查：防止目录遍历攻击
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(__dirname)) {
        console.log('403 - Forbidden path:', normalizedPath);
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    // 检查文件是否存在
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log('404 - File not found:', filePath);
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        // 读取并返回文件
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log('500 - Read error:', err.message);
                res.writeHead(500);
                res.end('Internal server error');
                return;
            }
            
            const mimeType = getMimeType(filePath);
            
            // 设置响应头
            res.writeHead(200, {
                'Content-Type': mimeType,
                'Cache-Control': 'no-cache', // 禁用缓存，便于开发调试
                'Access-Control-Allow-Origin': '*', // 允许跨域（仅用于开发）
                'Service-Worker-Allowed': '/' // 允许Service Worker控制根路径
            });
            
            res.end(data);
        });
    });
});

// 启动服务器
server.listen(PORT, () => {
    console.log(`🚀 ImportScripts Demo 服务器已启动`);
    console.log(`📍 访问地址: http://localhost:${PORT}`);
    console.log(`📁 服务目录: ${__dirname}`);
    console.log(`⏹️  按 Ctrl+C 停止服务器`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n👋 正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});