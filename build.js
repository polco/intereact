var webpack = require("webpack");
var config = require("./webpack.config.js");
var PROD = process.argv[2]

var plugins = config.plugins;

config.devtool = false;

if (!plugins) { config.plugins = []; }

if (PROD) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({ minimize: true }));
}

var compiler = webpack(config);

compiler.run(function(err, stats) {
  var compilationErrors = stats.compilation.errors;
  err = err || compilationErrors.length && compilationErrors;
  if (err) {
    return console.log(err);
  }
  console.log('build', new Date());
});
