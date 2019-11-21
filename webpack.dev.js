const webpack = require('webpack');
const WebpackNotifierPlugin = require('webpack-notifier');
const path = require('path');
const config = require('./webpack.config');

config.output = {
  filename: 'js/[name].js',
  path: path.resolve(__dirname, 'dist'),
};

config.devServer = {
  contentBase: path.join(__dirname, 'dist'),
  compress: true,
  port: 7000,
  historyApiFallback: true,
};

module.exports = config;