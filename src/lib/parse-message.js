import { h } from 'preact';
import { memoize } from 'decko';

/** Parse a text message into HTML returned as JSX */
export default memoize( text => {
	let parts = text.split(/\s/),
		isLink = /(^https?\:\/\/.+|[a-z0-9-]+\.[a-z]{2,6}\b)/i,
		built = [];
	for (let index=0; index<parts.length; index++) {
		let word = parts[index],
			out = word;
		if (word && word.match(isLink)) {
			let link = word;
			if (!link.match(/^https?\:\/\//)) link = `http://${link}`;
			word = word.replace(/\?.+$/,'…');
			if (word.length>100) word = word.substring(0,99) + '…';
			out = <a href={link} target="_blank">{word}</a>;
		}
		if (index) built.push(' ');
		built.push(out);
	}
	return built;
});
