const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        "vimeo-upload":     path.join(__dirname, 'src', 'main.ts'),
        "vimeo-upload.min": path.join(__dirname, 'src', 'main.ts'),
    },
    devtool: "source-map",
    output: {
        path: path.join(__dirname, 'dist'),
        filename: "[name].js",
        library: 'VimeoUpload',
        libraryTarget: 'var'
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'awesome-typescript-loader' }
        ]
    },
    resolve: {
        extensions: ['.ts']
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true
        })
    ]
};