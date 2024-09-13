function isARM64() {
  console.log(process.arch);
  return process.arch === 'arm64';
}

if (isARM64()) {
  console.log("这是运行在 64 位 ARM 架构上的 Node.js");
} else {
  console.log("这不是运行在 64 位 ARM 架构上的 Node.js");
}