#!/bin/bash

echo "🚀 启动 ImportScripts Demo"
echo "=========================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

# 检查Python是否安装（备选方案）
if ! command -v python3 &> /dev/null; then
    echo "⚠️  警告: 未找到 Python3"
fi

echo "📁 当前目录: $(pwd)"
echo "🌐 启动方式选择:"
echo "1. Node.js 服务器 (推荐)"
echo "2. Python 服务器"
echo "3. 手动选择"

read -p "请选择 (1-3): " choice

case $choice in
    1)
        echo "🚀 使用 Node.js 启动服务器..."
        node server.js
        ;;
    2)
        if command -v python3 &> /dev/null; then
            echo "🚀 使用 Python3 启动服务器..."
            python3 -m http.server 8080
        else
            echo "❌ Python3 未安装，请选择其他方式"
            exit 1
        fi
        ;;
    3)
        echo "📋 手动启动选项:"
        echo "Node.js:  node server.js"
        echo "Python3:  python3 -m http.server 8080"
        echo "PHP:      php -S localhost:8080"
        echo "npx:      npx serve . -p 8080"
        ;;
    *)
        echo "❌ 无效选择，使用默认 Node.js 服务器"
        node server.js
        ;;
esac