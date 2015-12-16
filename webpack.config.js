var webpack = require('webpack');

module.exports = {
    devtool: "source-map",
    debug: true,
    context: __dirname + '/app',
    entry: {
        assets: '.',
        javascript: './index.jsx',
        html: './index.html'
    },
    output: {
        filename: 'bundle.js',
        path: __dirname + '/dist'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
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
