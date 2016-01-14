import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

module.exports = {
	entry: './src/index.js',
	output: {
		path: './build',
		filename: 'bundle.js',
		publicPath: '/'
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
			// {
			// 	test: /\.(less|css)$/,
			// 	include: /src\/components\//,
			// 	loader: ExtractTextPlugin.extract('style', 'css?sourceMap&modules&importLoaders=1&localIdentName=[local]_[hash:base64:5]!autoprefixer!less?sourceMap')
			// },
			{
				test: /\.(less|css)$/,
				exclude: /src\/components\//,
				loader: ExtractTextPlugin.extract('style', 'css?sourceMap!autoprefixer!less?sourceMap')
			}
		]
	},
	plugins: ([
		new webpack.NoErrorsPlugin(),
		new ExtractTextPlugin('style.css', { allChunks: true }),
		new webpack.optimize.DedupePlugin(),
		new HtmlWebpackPlugin({
			template: 'src/index.html',
			minify: { collapseWhitespace: true },
			title: 'Nectarine: Peach for Web / Android',
			themeColor: '#673AB7',
			manifest: '/assets/manifest.json',
			favicon: 'src/assets/favicon.ico',
			icon: '/assets/icon-300.png'
		})
	]).concat(process.env.NODE_ENV==='production' ? [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			output: { comments: false }
		})
	] : []),
	stats: { colors: true },
	devtool: process.env.NODE_ENV==='production' ? 'source-map' : 'inline-source-map',
	devServer: {
		port: process.env.PORT || 8080,
		contentBase: './src',
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
