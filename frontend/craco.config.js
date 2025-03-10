const path = require('path');
const webpack = require('webpack');

// Import polyfills
require('core-js/stable');
require('regenerator-runtime/runtime');
require('whatwg-fetch');

module.exports = {
  babel: {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'entry',
          corejs: 3,
          targets: {
            android: '4.4',
            chrome: '49',
            browsers: [
              'last 2 versions',
              'not dead'
            ]
          }
        }
      ]
    ],
    plugins: [
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      ['@babel/plugin-transform-class-properties', { loose: true }]
    ]
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@styles': path.resolve(__dirname, 'src/styles'),
    },
    configure: (webpackConfig) => {
      // Entry points for polyfills
      const entries = Array.isArray(webpackConfig.entry) ? webpackConfig.entry : [webpackConfig.entry];
      webpackConfig.entry = [
        require.resolve('react-app-polyfill/stable'),
        require.resolve('react-app-polyfill/ie11'),
        require.resolve('./src/polyfills'),
        ...entries
      ];

      // Add fallbacks for Node.js core modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/"),
        "util": require.resolve("util/"),
      };

      // Add buffer to plugins
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser'
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        })
      ];

      return {
        ...webpackConfig,
        resolve: {
          ...webpackConfig.resolve,
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          fallback: webpackConfig.resolve.fallback
        }
      };
    }
  }
};