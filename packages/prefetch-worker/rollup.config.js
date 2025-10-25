import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

// 开发模式检测
const isDev = process.env.NODE_ENV === 'development';
const isWatch = process.env.ROLLUP_WATCH === 'true';

// 通用插件配置
const commonPlugins = [
  resolve({
    browser: true,
    preferBuiltins: false
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    sourceMap: isDev,
    inlineSources: isDev
  }),
  replace({
    __VERSION__: JSON.stringify(pkg.version),
    __DEV__: JSON.stringify(isDev),
    preventAssignment: true
  })
];

// 生产环境添加压缩
if (!isDev) {
  commonPlugins.push(terser({
    compress: {
      drop_console: false, // Service Worker需要console用于调试
      drop_debugger: true
    },
    mangle: {
      keep_fnames: true // 保持函数名，便于调试
    }
  }));
}

export default defineConfig([
  // ESM 格式 - 用于现代浏览器的 Service Worker
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/service-worker.esm.js',
      format: 'es',
      sourcemap: isDev,
      banner: `/**
 * @norejs/prefetch-worker v${pkg.version}
 * ES Module format for modern Service Workers
 * (c) 2024 NoReJS Team
 * @license MIT
 */`
    },
    plugins: [
      ...commonPlugins,
      replace({
        __FORMAT__: JSON.stringify('esm'),
        preventAssignment: true
      })
    ],
    external: [], // Service Worker 不应该有外部依赖
    watch: {
      include: 'src/**',
      exclude: 'node_modules/**'
    }
  },

  // UMD 格式 - 用于 importScripts
  {
    input: 'src/setup.ts',
    output: {
      file: 'dist/prefetch-worker.umd.js',
      format: 'umd',
      name: 'PrefetchWorker',
      sourcemap: isDev,
      banner: `/**
 * @norejs/prefetch-worker v${pkg.version}
 * UMD format for importScripts compatibility
 * (c) 2024 NoReJS Team
 * @license MIT
 */`
    },
    plugins: [
      ...commonPlugins,
      replace({
        __FORMAT__: JSON.stringify('umd'),
        preventAssignment: true
      })
    ],
    external: [],
    watch: {
      include: 'src/**',
      exclude: 'node_modules/**'
    }
  },

  // IIFE 格式 - 独立的 Service Worker 文件
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/service-worker.js',
      format: 'iife',
      sourcemap: isDev,
      banner: `/**
 * @norejs/prefetch-worker v${pkg.version}
 * Standalone Service Worker (IIFE format)
 * (c) 2024 NoReJS Team
 * @license MIT
 */`
    },
    plugins: [
      ...commonPlugins,
      replace({
        __FORMAT__: JSON.stringify('iife'),
        preventAssignment: true
      })
    ],
    external: [],
    watch: {
      include: 'src/**',
      exclude: 'node_modules/**'
    }
  },


]);