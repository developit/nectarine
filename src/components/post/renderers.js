import { h, Component } from 'preact';
import { memoize } from 'decko';
import parseMessageText from 'parse-message';
import ImageViewer from './image-viewer';
import VideoPlayer from './video-player';
import MusicPlayer from './music-player';
import optimisticHttps from 'optimistic-https';

export function renderItem(item) {
	let fn = renderer(item.type);
	if (!fn) {
		if (Object.keys(item).length>0) {
			console.warn(`Unknown type: ${item.type}`, item);
		}
		return null;
	}
	return <div class={'item item-'+item.type}>{ fn(item) }</div>;
}

// get the corresponding render method for a given item type
export const renderer = memoize( type => RENDERERS[String(type).toLowerCase()] );

const EMPTY = {};

const RENDERERS = {
	image: props => (
		<ImageViewer {...props} />
	),

	gif: props => (
		<ImageViewer {...props} />
	),

	video: props => (
		<VideoPlayer {...props} />
	),

	text: ({ text }) => (
		<p>{ parseMessageText(text) || ' ' }</p>
	),

	mention: props => RENDERERS.comment({
		commentBody:`${(props.author || props.authorStream || EMPTY).displayName} mentioned you`,
		...props
	}),

	tag: props => RENDERERS.comment({
		commentBody:`${(props.author || props.authorStream || EMPTY).displayName} tagged you`,
		...props
	}),

	comment: ({ type, commentBody, postMessage, author, authorStream, postID }) => {
		author = author || authorStream || EMPTY;
		return (
			<div class={`comment-block comment-type-${type}`}>
				{ renderItem(postMessage && postMessage[0] || EMPTY) }
				<div class="comment">
					{ renderer('text')({ text:commentBody }) }
					<author title={author.name}>{ author.displayName || null }</author>
				</div>
			</div>
		);
	},

	like: ({ postMessage, authorStream, postID }) => (
		<div class="like-block">
			{ renderItem(postMessage[0]) }
			<div class="like">
				{ authorStream.displayName } liked this
			</div>
		</div>
	),

	link: ({ title, description, url, imageURL }) => (
		<div class="item-link">
			<a href={url} target="_blank">{ title }</a>
			<p>{ description }</p>
			<img src={optimisticHttps(imageURL)} />
		</div>
	),

	music: props => (
		<MusicPlayer {...props} />
	),

	location: ({ name, iconSrc, lat, long, ...props }) => (
		<a href={`https://www.google.com/maps/place/${encodeURIComponent(name)}/@${encodeURIComponent(lat)},${encodeURIComponent(long)},17z/`} target="_blank" style="display:block;">
			{ iconSrc ? <img src={optimisticHttps(iconSrc)} width="26" height="26" style="float:left; background:#CCC; border-radius:50%;" /> : null }
			<div style="overflow:hidden; padding:5px;">{ name }</div>
		</a>
	)
};
