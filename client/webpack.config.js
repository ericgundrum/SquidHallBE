const webpack = require('webpack')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const roomLabel = "squidhalltest"

module.exports = function(options) {
  if (!options) options = {};

  const MODE = (options.production)
    ? "production"
    : "development";

  return {
    mode: MODE,

    entry: {
        colyseus: path.resolve('./index.js'),
    },

    output: {
      filename: '[name].bundle.js',
      path: __dirname + "/dist"
    },

    devtool: 'cheap-source-map',

    devServer: {
      contentBase: path.join(__dirname, 'squidhall'),
      disableHostCheck: true
    },

    module: {
      rules: [
        { test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader" }) },
        { test: /\.(woff|woff2|eot|ttf|svg)$/, loader: 'file-loader?limit=1024&name=[name].[ext]' },
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve('./squidhall/' + roomLabel + '.html')
      }),
    ],

    // Disable MAX 250kb entrypoint warnings on console
    performance: { hints: false },

    resolve: {
      extensions: ['.ts', '.js', '.json']
    }

  }
};
