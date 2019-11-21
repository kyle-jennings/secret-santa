const config = require('./webpack.config');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

config.mode = 'production';

config.output = {
  filename: 'js/[name].[hash].js',
  path: path.resolve(__dirname, 'dist'),
};

config.optimization = {
  minimize: true,
  minimizer: [
    new TerserPlugin({
      include: /\.min\.js$/,
    }),
    new OptimizeCSSAssetsPlugin({}),
  ],
};

module.exports = config;