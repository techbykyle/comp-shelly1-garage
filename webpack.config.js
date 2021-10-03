const HtmlWebpackPlugin = require("html-webpack-plugin")
const { ModuleFederationPlugin } = require('webpack').container

module.exports = {
    entry: './src/index.js',
    devServer: {
        host: '0.0.0.0',
        port: 3001
    },
    output: {
        chunkFilename: '[id].[contenthash].js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: ['@babel/preset-react'],
                },
            },
        ],
    },
    plugins: [
        new ModuleFederationPlugin({
            name: 'Shelly1Garage',
            filename: 'remoteEntry.js',
            shared: { 
                react: { requiredVersion: "16.13.1", singleton: true, eager: true }, 
                "react-dom": { requiredVersion: "16.13.1", singleton: true, eager: true }, 
                "react-redux": { requiredVersion: "7.2.3", singleton: true, eager: true } 
            },
            exposes: {
                'Shelly1Garage': './src/components/Shelly1Garage',
            }
        }),
        new HtmlWebpackPlugin({
            template: "./public/index.html",
        }),
    ],
}