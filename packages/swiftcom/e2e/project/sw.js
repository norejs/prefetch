// 用例设计
// 先执行初始化，再注册serviceWorker
// 先注册serviceWorker，再执行初始化
// 只有主进程初始化，没有注册serviceWorker，
// 主进程初始化后，serviceWorker版本发生了变化
// 主进程初始化后，serviceWorker 被其他的serviceWorker 接管
// 主进程初始化后，serviceWorker 被卸载
// 同名serviceWorker被注册，但是地址不同
// 同名serviceWorker被注册，地址相同
// 同名serviceWorker被注册，地址相同，但是版本不同