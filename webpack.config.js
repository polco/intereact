var webpack = require('webpack');
var ip = require('ip');

module.exports = {
    devtool: "source-map",
    debug: true,
    context: __dirname + '/app',
    entry: [
        'webpack-dev-server/client?http://' + ip.address() + ':8090',
        './index.html',
        './index.jsx'
    ],
    output: {
        filename: 'bundle.js',
        path: __dirname + '/dist'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react']
                }
            },
            {
                test: /\.less$/,
                loader: "style!css!less"
            },
            {
                test: /\.(svg|png|jpg)$/,
                loader: 'file?name=[name].[ext]'
            },
            {
                test: /\.html$/,
                loader: "file?name=[name].[ext]",
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
          'React': 'react'
        })
      ],
    resolve: {
        modulesDirectories: ['node_modules', './app/src'],
        extensions: ['', '.js', '.jsx', '.less']
    }
};
