# ImportScripts 基础 Demo

这个demo演示了Service Worker中`importScripts`的基本用法和常见问题。

## 文件结构

```
demos/importscripts-basic/
├── index.html          # 主页面
├── service-worker.js   # Service Worker主文件
├── utils.js           # 工具函数库
├── cache-helper.js    # 缓存辅助函数
└── README.md          # 说明文档
```

## 功能特性

### 1. ImportScripts 基本用法
- 演示如何在Service Worker中导入外部脚本
- 展示成功和失败的处理方式
- 记录导入状态和错误信息

### 2. 脚本内容
- **utils.js**: 通用工具函数（格式化、验证、日志等）
- **cache-helper.js**: 缓存操作辅助函数

### 3. 错误处理
- 捕获导入失败的脚本
- 提供降级处理方案
- 详细的错误日志

## 使用方法

### 1. 启动本地服务器
由于Service Worker需要HTTPS或localhost环境，你需要启动一个本地服务器：

```bash
# 使用Python (推荐)
cd demos/importscripts-basic
python3 -m http.server 8080

# 或使用Node.js
npx serve . -p 8080

# 或使用PHP
php -S localhost:8080
```

### 2. 访问页面
打开浏览器访问: `http://localhost:8080`

### 3. 测试步骤
1. 点击"注册 Service Worker"按钮
2. 观察控制台输出和页面日志
3. 点击"测试 Fetch"查看导入的脚本是否正常工作
4. 使用开发者工具查看Network和Application面板

## ImportScripts 要求

### 1. 同源策略
- 脚本必须与Service Worker同源
- 或者服务器正确设置CORS头

### 2. HTTP状态码
- 必须返回200状态码
- 4xx或5xx状态码会导致导入失败

### 3. Content-Type
- 应该是`application/javascript`或`text/javascript`
- 某些服务器可能需要正确配置MIME类型

### 4. 语法正确性
- 脚本必须是有效的JavaScript代码
- 语法错误会导致整个Service Worker失败

### 5. 同步加载
- `importScripts`是同步操作
- 会阻塞执行直到脚本加载完成
- 不支持异步加载

## 常见问题

### 1. 导入失败
```javascript
// 错误示例
importScripts('https://external-domain.com/script.js'); // 跨域错误

// 正确示例
importScripts('./local-script.js'); // 同源脚本
```

### 2. 错误处理
```javascript
try {
    importScripts('./optional-script.js');
    console.log('脚本导入成功');
} catch (error) {
    console.warn('脚本导入失败，使用降级方案', error);
    // 提供降级功能
}
```

### 3. 条件导入
```javascript
// 根据条件导入不同脚本
if (someCondition) {
    importScripts('./feature-a.js');
} else {
    importScripts('./feature-b.js');
}
```

## 调试技巧

### 1. 使用开发者工具
- **Application > Service Workers**: 查看Service Worker状态
- **Network**: 检查脚本加载请求
- **Console**: 查看错误信息

### 2. 添加详细日志
```javascript
console.log('开始导入脚本...');
try {
    importScripts('./script.js');
    console.log('✓ 脚本导入成功');
} catch (error) {
    console.error('✗ 脚本导入失败:', error);
}
```

### 3. 检查网络请求
确保脚本文件可以通过HTTP正常访问：
```bash
curl -I http://localhost:8080/utils.js
```

## 最佳实践

1. **错误处理**: 总是使用try-catch包装importScripts
2. **降级方案**: 为关键功能提供备选实现
3. **条件导入**: 只导入必要的脚本
4. **版本管理**: 使用版本号管理脚本更新
5. **性能考虑**: 避免导入过大的脚本文件