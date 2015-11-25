module.exports = {
    devtool: "source-map",
    debug: true,
    context: __dirname + '/src',
    entry: {
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
                test: /\.html$/,
                loader: "file?name=[name].[ext]"
            }
        ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
      })
    ]
    resolve: {
        modulesDirectories: ['node_modules', './src'],
        extensions: ['', '.js', '.jsx', '.less']
    }
}
