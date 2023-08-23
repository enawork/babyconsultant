const path = require('path')

module.exports = argv => ({
  entry: {
    desktop: './src/desktop/desktop.js',
    config: './src/config/config.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
          plugins: ['@babel/plugin-transform-runtime']
        }
      }
    ]
  },
  target: ['web', 'es5'],
  output: {
    path: path.resolve(__dirname, 'pack')
  },
  devtool: argv.mode === 'production' ? undefined : 'inline-source-map'
})
