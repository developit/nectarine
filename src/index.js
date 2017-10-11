import { h, render } from 'preact';
import 'linkstate/polyfill';
import 'material-design-lite/material.js';
import './style';
require('offline-plugin/runtime').install();

let root;
function init() {
	let App = require('./components/app').default;
	root = render(<App />, document.body, root);
}

init();

if (process.env.NODE_ENV==='development' && module.hot) {
	module.hot.accept('./components/app', () => requestAnimationFrame(init));
}
