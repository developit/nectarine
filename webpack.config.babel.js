/* eslint-disable */
import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import OfflinePlugin from 'offline-plugin';
import autoprefixer from 'autoprefixer';


module.exports = {
	context: path.resolve(__dirname, 'src'),
	entry: './index.js',

	output: {
		path: path.resolve(__dirname, 'build'),
		publicPath: '/',
		filename: 'bundle.[hash].js',
		chunkFilename: '[name].[chunkhash].chunk.js'
	},

	resolve: {
		modules: ['./src/lib', 'node_modules'],
		extensions: ['.jsx', '.less', '.js', '.json']
	},

	module: {
		// preLoaders: [
		// 	{
		// 		exclude: /src\//,
		// 		loader: 'source-map'
		// 	}
		// ],
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
			{
				test: /\.(less|css)$/,
				exclude: /src\/components\//,
				loader: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						{ loader: 'css-loader', options: { sourceMap: true } },
						{ loader: 'postcss-loader', options: {
							sourceMap: true,
							plugins: [
								autoprefixer({ browsers: 'last 2 versions, iOS >= 7' })
							]
						} },
						{ loader: 'less-loader', options: { sourceMap: true } }
					]
				})
			}
		]
	},

	plugins: ([
		new ProgressBarPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
		new ExtractTextPlugin('style.[chunkhash].css', {
			allChunks: false,
			disable: process.env.NODE_ENV!=='production'
		}),
		new webpack.DefinePlugin({
			process: {},
			'process.env': {},
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
		}),
		new HtmlWebpackPlugin({
			template: 'index.ejs',
			filename: 'index.html',
			inject: false,
			minify: {
				collapseWhitespace: true,
				removeComments: true
			},
			title: 'Nectarine: Peach for Web / Android',
			themeColor: '#673AB7',
			manifest: '/assets/manifest.json',
			favicon: 'assets/favicon.ico',
			icon: '/assets/icon-300.png'
		})
	]).concat(process.env.NODE_ENV==='production' ? [
		new OfflinePlugin({
			relativePaths: false,
			publicPath: '/',
			updateStrategy: 'all',
			version: '[hash]',
			preferOnline: true,
			safeToUseOptionalCaches: true,
			caches: 'all',
			ServiceWorker: {
				navigateFallbackURL: '/',
				events: true
			},
			AppCache: {
				FALLBACK: { '/': '/' }
			}
		})
	] : []),

	stats: false,

	node: {
		process: false,
		Buffer: false,
		__filename: false,
		__dirname: false,
		setImmediate: false
	},

	devtool: process.env.NODE_ENV==='production' ? 'source-map' : 'inline-source-map',

	devServer: {
		host: '0.0.0.0',
		port: process.env.PORT || 8080,
		quiet: true,
		compress: true,
		contentBase: `${__dirname}/src`,
		historyApiFallback: true,
		proxy: {
			'/api*': {
				// path: /^\/api(\/|$)/g,
				target: 'https://v1.peachapi.com',
				secure: false,
				changeOrigin: true,
				rewrite(req) {
					req.url = req.url.replace(/^\/[^\/]+\//, '');
				}
			}
		}
	}
};
