const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');

module.exports = (env) => {
    console.log('Production: ', env.production);
    const appEnv = process.env.ENV ? process.env.ENV : 'nightly';
    console.log('ENV', appEnv);
    const jsxPlugins = [['@babel/plugin-proposal-decorators', { legacy: true }]];
    const plugins = [
        new webpack.DefinePlugin({
            __ENV__: JSON.stringify(appEnv),
            process: { platform: {} }
        }),
        new HtmlWebpackPlugin({
            template: './index.html',
            favicon: path.resolve(__dirname, 'favicon.ico')
        })
    ];
    if (!env.production) {
        jsxPlugins.unshift(require.resolve('react-refresh/babel'));
        plugins.unshift(new ReactRefreshPlugin());
    }

    return {
        entry: {
            app: './index.tsx'
        },
        output: {
            chunkFilename: (pathData) => {
                return pathData.chunk.name === 'main' ? '[name].js' : '[name]/[name].js';
            },
            path: path.join(__dirname, '../../dist')
        },
        mode: env.production ? 'production' : 'development',
        devtool: env.production ? false : 'source-map',
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json'],
            alias: {
                '@src': path.resolve(__dirname, '../'),
                '@www': path.resolve(__dirname, './')
            },
            fallback: {
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify')
            }
        },
        devServer: {
            static: {
                directory: path.join(__dirname, './src/www')
            },
            port: 8088,
            watchFiles: [path.resolve(__dirname, './**')]
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'esbuild-loader',
                    options: {
                        loader: 'tsx',
                        target: 'chrome80',
                        tsconfigRaw: require('../../tsconfig.json')
                    }
                },
                {
                    test: /\.(css|less)$/,
                    use: [
                        {
                            loader: 'style-loader'
                        },
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'esbuild-loader',
                            options: {
                                loader: 'css',
                                minify: process.env.NODE_ENV === 'production' ? true : false
                            }
                        },
                        {
                            loader: 'less-loader'
                        },
                        {
                            loader: 'style-resources-loader',
                            options: {
                                patterns: path.resolve(__dirname, 'styles/common.less')
                            }
                        }
                    ]
                },
                {
                    test: /\.(jpg|png|svg|ico|icns)$/,
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]'
                    }
                }
            ]
        },
        plugins: plugins,
        externals: [
            function ({ context, request }, callback) {
                if (/cyfs-sdk$/.test(request)) {
                    console.log('replace', request);
                    return callback(null, 'cyfs');
                }
                callback();
            }
        ]
    };
};
