import emitter from 'mitt';

/*global ga*/

const pubsub = emitter();
export default pubsub;

let { emit, on, off } = pubsub;
export { emit, on, off };

on('track', url => {
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
