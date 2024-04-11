// 集成whistle规则，便于开发测试
const pkg = require('./package.json');
// 检测是否安装了whistle
exports.groupName = 'dev-proxys'; // 可选，设置分组， 要求 Whistle 版本 >= v2.9.21
exports.name = `${pkg.name}`;
exports.rules = `
https://**.ctripcorp.com/prefetch-demo http://localhost:9000/prefetch-demo
https://**.ctripcorp.com/prefetch-demo/static http://localhost:9000/static
`;
