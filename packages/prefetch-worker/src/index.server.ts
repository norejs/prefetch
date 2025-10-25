// 静态服务器，用于提供Service Worker文件
import express from 'express';
import path from 'path';

const app = express();
const port = 3001; // 你可以选择任意未被占用的端口

// 添加 CORS 支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Embedder-Policy', 'cross-origin');
  res.header('Cross-Origin-Opener-Policy', 'cross-origin');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 指定静态文件目录 - 使用绝对路径
const staticPath = path.join(__dirname, '../worker');
console.log('Serving static files from:', staticPath);
app.use(express.static(staticPath));

// 添加健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Static files served from: ${staticPath}`);
});
