// 静态服务器，用于提供Service Worker文件
// import express from 'express';

// const app = express();
// const port = 8080; // 你可以选择任意未被占用的端口

// // 指定静态文件目录
// app.use(express.static('dist/worker'));

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });
export const currentDir = __dirname;
