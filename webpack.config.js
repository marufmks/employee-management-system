const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    ...defaultConfig,
    plugins: [
        ...defaultConfig.plugins,
        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
    ],
    entry: {
        index: './src/index.js',
        admin: './src/styles/admin.css',
        frontend: './src/styles/frontend.css'
    }
}; 