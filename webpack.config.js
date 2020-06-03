//конфигурация webpack
const path = require('path')

module.exports = (env, argv) => {
    let mode = argv.mode || 'development';
    let isDevelopment = mode == 'development';
    let isProduction = !isDevelopment;

    let conf = {
        context: path.resolve(__dirname, 'src_wp'),
        entry: {
            SYSlider: './SYSlider.js',
        },
        output: {
            filename: 'SYSlider.min.js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/',
            libraryTarget: 'umd',
            library: 'SYSlider'
        },
        mode,
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /\/node_modules\//,
                    loader: 'babel-loader',
                },
            ]
        },
        devServer: {
            contentBase: path.join(__dirname, 'dist')
        },
        devtool: isDevelopment ? 'eval' : false
    }

    return conf;
};