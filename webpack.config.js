
module.exports = {
entry: {
    app: './src/main.ts',
    vendor: './src/vendor.ts'
  },
  output: {
    filename: 'app.js'
  },
  rules: [
    {
      test: /\.ts$/,
      loader: 'awesome-typescript-loader'
    },
    {
      test: /\.css$/,
      loaders: 'style-loader!css-loader'
    }
  ],
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
};