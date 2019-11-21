const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack')
const WebpackNotifierPlugin = require('webpack-notifier');
const autoprefixer = require('autoprefixer');
const distName = require('./package.json').name;
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // installed via npm


const paths = {
  root: './',
  srcRoot: './_src',
  distRoot: './dist',
  npmRoot: './node_modules',
  scssPath: './_src/scss',
  scssGlob: './_src/scss/**/*.scss',
};

module.exports = {
  entry: {
    [distName]: './_src/entry.js',
  },
  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      // js
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          },
        },
      },
      // css
      {
        test: /\.css$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: 'css-loader' }
        ],
      },
      // scss
      {
        test: /\.scss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: 'css-loader',
            options: { sourceMap: true },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              sourceMap: true,
              plugins: [
                autoprefixer({ browsers: ['last 2 version'] }),
              ],
            },
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: [
                paths.npmRoot + '/hamburgers/_sass',
                paths.npmRoot + '/@fortawesome/fontawesome-free',
                paths.npmRoot + '/normalize.css',
                paths.npmRoot + '/bulma-scss',
                paths.srcRoot + '/scss',
              ],
            },
          },
        ],
      },
      // fonts
      {
        test: /\.(woff(2)?|ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
          outputPath: 'fonts',
          publicPath: '../fonts',
        },
      },
      // images
      {
        test: /\.(jpg|png|svg|gif)$/,
        loader: 'file-loader',
        options: {
          limit: 1,
          name: '[name].[ext]',
          outputPath: 'img',
          publicPath: '../img',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: 'Foo',
      filename: 'index.html',
      template: '_src/html/index.html',
      // inject: true,
      // minify: false,
      chunks: 'all',
      chunksSortMode: 'auto',
    }),
    new HtmlReplaceWebpackPlugin([
      {
        pattern: '{{project-name}}',
        replacement: distName,
      },
    ]), 
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: '[id].css',
    }),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'),
        to: path.resolve(__dirname, 'dist/fonts'),
      },
      {
        from: path.resolve(__dirname, '_src/img'),
        to: path.resolve(__dirname, 'dist/img'),
      },
    ]),
    new (
      webpack.optimize.OccurenceOrderPlugin
      || webpack.optimize.OccurrenceOrderPlugin
    )(),
    new WebpackNotifierPlugin(),
  ],
};
