#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8081;

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.txt': 'text/plain'
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
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }
    
    // 检查文件是否存在
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log('404 - File not found:', filePath);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }
        
        // 读取并返回文件
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log('500 - Read error:', err.message);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal server error');
                return;
            }
            
            const mimeType = getMimeType(filePath);
            
            // 设置响应头
            const headers = {
                'Content-Type': mimeType,
                'Cache-Control': 'no-cache', // 禁用缓存，便于开发调试
                'Access-Control-Allow-Origin': '*', // 允许跨域（仅用于开发）
                'Service-Worker-Allowed': '/' // 允许Service Worker控制根路径
            };
            
            // 为JavaScript文件添加ES Module支持
            if (mimeType === 'application/javascript') {
                headers['X-Content-Type-Options'] = 'nosniff';
            }
            
            res.writeHead(200, headers);
            res.end(data);
            
            console.log(`200 - Served: ${filePath} (${mimeType})`);
        });
    });
});

// 错误处理
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT} 已被占用`);
        console.log('请尝试以下解决方案:');
        console.log('1. 关闭占用端口的程序');
        console.log('2. 使用其他端口: PORT=8082 node server.js');
        console.log('3. 查找占用进程: lsof -i :' + PORT);
    } else {
        console.error('❌ 服务器错误:', err);
    }
    process.exit(1);
});

// 启动服务器
server.listen(PORT, () => {
    console.log('🚀 Service Worker ESM 测试服务器已启动');
    console.log(`📍 访问地址: http://localhost:${PORT}`);
    console.log(`📁 服务目录: ${__dirname}`);
    console.log('📋 功能特性:');
    console.log('  ✅ ES Module 支持');
    console.log('  ✅ Service Worker 支持');
    console.log('  ✅ 动态导入测试');
    console.log('  ✅ Import Map 测试');
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

// 未捕获异常处理
process.on('uncaughtException', (err) => {
    console.error('❌ 未捕获的异常:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未处理的Promise拒绝:', reason);
    process.exit(1);
});