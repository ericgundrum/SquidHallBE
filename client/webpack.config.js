const webpack = require('webpack')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = function(options) {
  if (!options) options = {};

  const MODE = (options.production)
    ? "production"
    : "development";

  return {
    mode: MODE,

    entry: {
      main: path.resolve('./index.js')
    },

    output: {
      path: __dirname + "/dist",
      filename: 'bundle.js'
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
        { test: require.resolve('./squidhall/libs/modules/furniture.js'), use: 'exports-loader?exports=default|[name]' },
        { test: require.resolve('./squidhall/libs/modules/hall.js'), use: 'exports-loader?exports=default|[name]' },
        { test: require.resolve('./squidhall/libs/modules/content.js'), use: 'exports-loader?type=commonjs&exports=single|[name]' },
        { test: require.resolve('./squidhall/libs/modules/world.js'), use: 'exports-loader?type=commonjs&exports=single|[name]' },
        { test: require.resolve('./squidhall/libs/squidhall.js'), use: 'exports-loader?type=commonjs&exports=single|SquidHall' },
//        { test: require.resolve('./squidhall/libs/squidhalldebug.js'), use: 'exports-loader?type=commonjs&exports=single|SquidHallDebug' },
        { test: require.resolve('./squidhall/libs/squidmods/squidcommon.js'), use: 'exports-loader?type=commonjs&exports=single|SQUIDCOMMON' },
        { test: require.resolve('./squidhall/libs/squidmods/squiddebug.js'), use: 'exports-loader?type=commonjs&exports=single|SQUIDDEBUG' },
        { test: require.resolve('./squidhall/libs/squidspace.js'), use: 'exports-loader?type=commonjs&exports=single|SQUIDSPACE' },
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve('./squidhall.html')
      }),
    ],

    // Disable MAX 250kb entrypoint warnings on console
    performance: { hints: false },

    resolve: {
      extensions: ['.ts', '.js', '.json']
    }

  }
};
