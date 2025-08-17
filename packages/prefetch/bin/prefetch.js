#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);

// 检查第一个参数必须是 install
if (args.length === 0 || args[0] !== 'install') {
  console.error('错误: 必须指定 install 子命令');
  console.log('');
  showHelp();
}

let targetDir = 'public'; // 默认目标目录

// 显示帮助信息
function showHelp() {
  console.log(`
使用方法: 
  prefetch install [选项]

选项:
  --dir, -d <目录>    指定复制文件的目标目录 (默认: public)
  --help, -h          显示帮助信息

示例:
  prefetch install                       # 复制到 public 目录
  prefetch install --dir static         # 复制到 static 目录  
  prefetch install -d assets            # 复制到 assets 目录
`);
  process.exit(0);
}

// 解析命令行参数（从索引1开始，跳过 install 子命令）
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--dir' || args[i] === '-d') {
    if (i + 1 < args.length) {
      targetDir = args[i + 1];
      i++; // 跳过下一个参数
    }
  } else if (args[i] === '--help' || args[i] === '-h') {
    showHelp();
  }
}

// 获取当前工作目录（执行命令的项目目录）
const cwd = process.cwd();
const targetPath = path.resolve(cwd, targetDir);

/**
 * 查找 @norejs/prefetch-worker 包的位置
 * 考虑依赖提升的情况
 */
function findPrefetchWorkerPackage() {
  const possiblePaths = [
    // 当前包的 node_modules（未提升）
    path.resolve(__dirname, '../node_modules/@norejs/prefetch-worker'),
    // 父级的 node_modules（提升到根目录）
    path.resolve(__dirname, '../../node_modules/@norejs/prefetch-worker'),
    // 再上一级的 node_modules（monorepo 或深层嵌套）
    path.resolve(__dirname, '../../../node_modules/@norejs/prefetch-worker'),
    // 全局查找（通过 require.resolve）
  ];

  // 首先尝试直接路径查找
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      return possiblePath;
    }
  }

  // 如果直接路径找不到，尝试通过 require.resolve 查找
  try {
    const workerPackageJson = require.resolve('@norejs/prefetch-worker/package.json');
    return path.dirname(workerPackageJson);
  } catch (error) {
    // 如果还是找不到，尝试从当前执行目录开始查找
    let currentDir = cwd;
    while (currentDir !== path.dirname(currentDir)) {
      const possiblePath = path.join(currentDir, 'node_modules/@norejs/prefetch-worker');
      if (fs.existsSync(possiblePath)) {
        return possiblePath;
      }
      currentDir = path.dirname(currentDir);
    }
  }

  return null;
}

// 获取 prefetch-worker 包的路径
const prefetchWorkerPackage = findPrefetchWorkerPackage();

if (!prefetchWorkerPackage) {
  console.error('✗ 错误: 未找到 @norejs/prefetch-worker 包');
  console.error('  请确保已正确安装 @norejs/prefetch 包');
  process.exit(1);
}

const distWorkerDir = path.join(prefetchWorkerPackage, 'dist', 'worker');

// 要复制的文件列表
const filesToCopy = ['service-worker.js'];

function copyFile(src, dest) {
  try {
    // 确保目标目录存在
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
      console.log(`✓ 创建目录: ${destDir}`);
    }

    // 复制文件
    fs.copyFileSync(src, dest);
    console.log(`✓ 已复制: ${path.basename(src)} -> ${dest}`);
  } catch (error) {
    console.error(`✗ 复制失败: ${src} -> ${dest}`);
    console.error(`  错误: ${error.message}`);
    process.exit(1);
  }
}

function main() {
  console.log(`🚀 安装 Prefetch Service Worker 文件到: ${targetPath}`);
  console.log(`📦 从包位置: ${prefetchWorkerPackage}`);
  console.log('');

  // 检查源文件是否存在
  if (!fs.existsSync(distWorkerDir)) {
    console.error(`✗ 错误: 未找到构建文件目录: ${distWorkerDir}`);
    console.error('  请先运行 "npm run build" 或 "pnpm build" 构建项目');
    process.exit(1);
  }

  let copiedCount = 0;
  let totalFiles = filesToCopy.length;

  // 复制每个文件
  filesToCopy.forEach(fileName => {
    const srcFile = path.join(distWorkerDir, fileName);
    
    if (!fs.existsSync(srcFile)) {
      console.warn(`⚠ 警告: 文件不存在，跳过: ${srcFile}`);
      totalFiles--;
      return;
    }

    const destFile = path.join(targetPath, fileName);
    copyFile(srcFile, destFile);
    copiedCount++;
  });

  console.log('');
  console.log(`🎉 安装完成! 成功复制 ${copiedCount}/${totalFiles} 个文件到 ${targetPath}`);
  
  if (copiedCount > 0) {
    console.log('');
    console.log('已安装的文件:');
    filesToCopy.forEach(fileName => {
      const srcFile = path.join(distWorkerDir, fileName);
      if (fs.existsSync(srcFile)) {
        console.log(`  • ${fileName}`);
      }
    });
    
    console.log('');
    console.log('下一步:');
    console.log('  1. 在你的应用中导入并初始化 Prefetch:');
    console.log('     import { setup } from "@norejs/prefetch"');
    console.log('     await setup({ serviceWorkerUrl: "/service-worker.js" })');
    console.log('');
    console.log('  2. 查看完整文档: https://github.com/your-repo/prefetch');
  }
}

// 运行主函数
main();
