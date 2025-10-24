module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,gif,svg,ico}'
  ],
  swDest: 'build/service-worker.js',
  swSrc: 'public/service-worker.js',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
};
