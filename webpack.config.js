//конфигурация webpack
const path = require('path')

module.exports = (env, argv) => {
    let mode = argv.mode || 'development';
    let isDevelopment = mode == 'development';
    let isProduction = !isDevelopment;

    let conf = {
        context: path.resolve(__dirname, 'src_wp'),
        entry: {
            main: './scripts/main.js',
        },
        output: {
            filename: 'scripts/[name].min.js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/'
        },
        mode,
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /\/node_modules\//,
                    loader: 'babel-loader',
                    // options: {
                    //     presets: ['@babel/preset-env']
                    // }
                },
                {
                    test: /\.css$/,
                    loader: 'css-loader'
                },
                {
                    test: /\.s[ac]ss$/,
                    loader: 'style-loader!css-loader!postcss-loader!sass-loader'
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    loader: 'file-loader',
                    options: {
                        name: `[path][name].[ext]`,
                        esModule: false,
                    }
                }
            ]
        },
        // optimization: {
        //     runtimeChunk: { name: 'common' },
        //     splitChunks: {
        //         cacheGroups: {
        //             default: false,
        //             commons: {
        //                 test: /\.jsx?$/,
        //                 chunks: 'all',
        //                 minChunks: 2,
        //                 name: 'common',
        //                 enforce: true,
        //             },
        //         },
        //     },
        // },
        devServer: {
            contentBase: path.join(__dirname, 'dist')
        },
        devtool: isDevelopment ? 'eval-sourcemap' : false
    }

    return conf;
};