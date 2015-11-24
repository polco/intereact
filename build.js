var webpack = require("webpack");
var PROD = process.argv[2]

var compiler = webpack({
  entry: "./src/index.jsx",
  output: {
    filename: "./dist/bundle.js"
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
  resolve: {
    modulesDirectories: ['node_modules', './src'],
    extensions: ['', '.js', '.jsx', '.less']
  },
  plugins: PROD ? [
    new webpack.optimize.UglifyJsPlugin({ minimize: true })
  ] : []
});

compiler.run(function(err, stats) {
  var compilationErrors = stats.compilation.errors;
  err = err || compilationErrors.length && compilationErrors;
  if (err) {
    return console.log(err);
  }
  console.log('build', new Date());
});
