/* eslint-disable */
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import OfflinePlugin from 'offline-plugin';
import autoprefixer from 'autoprefixer';


module.exports = {
	context: `${__dirname}/src`,
	entry: './index.js',

	output: {
		path: `${__dirname}/build`,
		publicPath: '/',
		filename: 'bundle.[hash].js',
		chunkFilename: '[name].[chunkhash].chunk.js'
	},

	resolve: {
		modulesDirectories: ['./src/lib', 'node_modules'],
		extensions: ['', '.jsx', '.less', '.js', '.json']
	},

	module: {
		preLoaders: [
			{
				exclude: /src\//,
				loader: 'source-map'
			}
		],
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel'
			},
			{
				test: /\.(less|css)$/,
				exclude: /src\/components\//,
				loader: ExtractTextPlugin.extract('style', 'css?sourceMap!postcss!less?importLoaders=1&sourceMap')
			}
		]
	},

	postcss: () => [
		autoprefixer({ browsers: 'last 2 versions, iOS >= 7' })
	],

	plugins: ([
		new ProgressBarPlugin(),
		new webpack.NoErrorsPlugin(),
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
			template: './index.html',
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
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			mangle: true,
			compress: { warnings: false },
			output: { comments:false }
		}),
		new OfflinePlugin({
			relativePaths: false,
			publicPath: '/',
			updateStrategy: 'all',
			version: 'hash',
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
