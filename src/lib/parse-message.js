import { h } from 'preact';
import { memoize } from 'decko';

const WEB_LINK = /\b(https?\:\/\/.+|([a-z0-9-]+\.)*([a-z0-9-]{2,})\.[a-z]{2,6}\b)/i;

const WEB_LINK_TAIL = /[.,\)\]!"'\s]+$/i;

const NO_MATCH = [''];

/** Parse a text message into HTML returned as JSX */
export default memoize( text => {
	let parts = text.split(/\s/),
		built = [];
	for (let index=0; index<parts.length; index++) {
		let word = parts[index],
			out = word,
			extra;
		if (word && word.match(WEB_LINK)) {
			extra = (word.match(WEB_LINK_TAIL) || NO_MATCH)[0];
			let link = word = word.substring(0, word.length - extra.length);
			if (!link.match(/^https?\:\/\//)) link = `http://${link}`;
			word = word.replace(/\?.+$/,'…');
			if (word.length>100) word = word.substring(0,99) + '…';
			out = <a href={link} target="_blank">{word}</a>;
		}
		if (out) {
			if (built.length) append(built, ' ');
			append(built, out);
			if (extra) append(built, extra);
		}
	}
	return built;
});

function append(arr, item) {
	let i = arr.length-1;
	if (i>-1 && typeof arr[i]==='string' && typeof item==='string') {
		arr[i] += item;
	}
	else {
		arr.push(item);
	}
}
