import Emitter from 'wildemitter';

/*global ga*/

const pubsub = new Emitter();
export default pubsub;

let emit = ::pubsub.emit;
let on = ::pubsub.on;
let off = ::pubsub.off;
export { emit, on, off };

pubsub.on('track', url => {
	let type = 'pageview';
	if (url && typeof url==='object') {
		type = url.type;
		url = url.url;
	}
	if (typeof url!=='string') return;
	if (url.charAt(0)!=='/') url = `/${url}`;
	if (typeof ga==='function') {
		ga('send', type, url);
	}
});
