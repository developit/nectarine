import { h, Component } from 'preact';
import { TextField, Button, Icon } from 'preact-mdl';
import parseMessageText from 'parse-message';
import neatime from 'neatime';
import { bind } from 'decko';
import { emit } from '../pubsub';

const EMPTY = {};


const RENDERERS = {
	image: props => (<ImageViewer {...props} />),

	gif: props => (<ImageViewer {...props} />),

	video: props => (<VideoPlayer {...props} />),

	text: ({ text }) => (<p>{ parseMessageText(text) || ' ' }</p>),

	mention: props => RENDERERS.comment(props),

	comment: ({ commentBody, postMessage, author, authorStream, postID }) => (
		<div class="comment-block">
			{ renderItem(postMessage && postMessage[0] || EMPTY) }
			<div class="comment">
				{ RENDERERS.text({ text:commentBody }) }
				<author>{ (author || authorStream || EMPTY).displayName || null }</author>
			</div>
		</div>
	),

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
			<img src={imageURL} />
		</div>
	),

	music: props => (<MusicPlayer {...props} />),

	location: ({ name, iconSrc, lat, long }) => (
		<a href={`http://maps.google.com/maps?q=${encodeURIComponent(lat)},${encodeURIComponent(long)}`} target="_blank" style="display:block;">
			{ iconSrc ? <img src={iconSrc} width="26" height="26" style="float:left; background:#CCC; border-radius:50%;" /> : null }
			<div style="overflow:hidden; padding:5px;">{ name }</div>
		</a>
	)
};


const renderItem = item => {
	let fn = RENDERERS[String(item.type).toLowerCase()];
	if (!fn) {
		if (Object.keys(item).length>0) {
			console.warn(`Unknown type: ${item.type}`, item);
		}
		return null;
	}
	return <div class={'item item-'+item.type}>{ fn(item) }</div>;
};



const noBubble = e => {
	if (e) e.stopPropagation();
};



export default class Post extends Component {
	@bind
	goAuthor(e) {
		let { author, body } = this.props,
			inlineAuthor = e && e.target && e.target.getAttribute('data-author-id'),
			id = inlineAuthor || (author && author.id) || (body && body.authorStream && body.authorStream.id);
		if (id) {
			emit('go', { url:`/profile/${encodeURIComponent(id)}` });
		}
		noBubble(e);
	}

	isLiked() {
		let { id, likedByMe } = this.props,
			{ localLikes } = peach.store.getState();
		return localLikes && localLikes.hasOwnProperty(id) ? localLikes[id] : likedByMe || false;
	}

	likeCount() {
		let { id, likeCount, likedByMe } = this.props,
			{ localLikes } = peach.store.getState();
		return (likeCount || 0) + (localLikes && localLikes[id]===true && likedByMe!==true ? 1 : 0);
	}

	@bind
	toggleLike(e) {
		let liked = !this.isLiked(),
			{ id } = this.props,
			{ localLikes={} } = peach.store.getState();
		localLikes[id] = liked;
		peach.store.setState({ localLikes });
		//LOCAL_LIKES[id] = liked;
		this.setState({ liked });
		peach[liked?'like':'unlike'](id, err => {
			if (err) alert(`Error: ${err}`);
		});
		noBubble(e);
	}

	@bind
	renderInlineComment({ author, body }) {
		let avatar = author.avatarSrc;
		return (
			<div class="comment">
				<div class="avatar" data-author-id={author.id} onClick={this.goAuthor} style={avatar ? `background-image: url(${avatar});` : null} />
				{ RENDERERS.text({ text:body }) }
				<author>{ author.displayName }</author>
			</div>
		);
	}

	@bind
	comment(e) {
		if (e && e.keyCode && e.keyCode!==13) return;
		let { newComment, comments=[] } = this.state,
			author = peach.store.getState().profile || {};
		if (newComment) {
			// comments.push({ author, body:newComment });
			// this.setState({ newComment: '', comments });
			peach.comment({
				postId: this.props.id,
				body: newComment
			}, (err, comment) => {
				if (err) return alert(`Error: ${err}`);
				comments.push(comment);
				this.setState({ newComment: '', comments });
			});
		}
		e.preventDefault();
		return false;
	}

	render({ id, minimal=false, type, body, message, comments=[], createdTime }, { newComment, comments:stateComments }) {
		let author = body && body.authorStream,
			avatar = author && author.avatarSrc,
			isLiked = this.isLiked(),
			likeCount = this.likeCount();
		if (stateComments) {
			let commentIds = comments.map( c => c.id );
			comments = comments.concat(stateComments.filter( c => commentIds.indexOf(c.id)<0 ));
		}
		if (!message || !message[0]) {
			message = body && body.message || body;
		}
		if (!message) message = [];
		if (!Array.isArray(message)) {
			message = [message];
		}
		for (let i=message.length; i--; ) {
			if (typeof message[i]==='string') {
				message[i] = { type:'text', text:message[i] };
			}
			if (!message[i].type) {
				message[i].type = type;
			}
		}

		if (minimal) return (
			<div class={'post type-'+type}>
				{ author ? (
					<div class="avatar" onClick={this.goAuthor} style={`background-image: url(${avatar});`} />
				) : null }
				<span class="post-time">{ neatime(createdTime * 1000) }</span>
				<div class="items">{
					message.map(renderItem)
				}</div>
			</div>
		);

		return (
			<div class={'post type-'+type}>
				{ author ? (
					<div class="avatar" onClick={this.goAuthor} style={`background-image: url(${avatar});`} />
				) : null }
				<span class="post-time">{ neatime(createdTime * 1000) }</span>
				<Button icon class="like-unlike" is-liked={isLiked || null} onClick={this.toggleLike}>
					<Icon icon="favorite" badge={likeCount || null} />
				</Button>
				<div class="items">{
					message.map(renderItem)
				}</div>
				<div class="comments" onClick={noBubble}>
					{ comments && comments.length ? (
						comments.map(this.renderInlineComment)
					) : null }
				</div>
				<div class="post-new-comment" onClick={noBubble}>
					<TextField multiline placeholder="Witty remark" value={newComment} onInput={this.linkState('newComment')} onKeyDown={this.comment} />
					<Button icon onClick={this.comment}><Icon icon="send" /></Button>
				</div>
			</div>
		);
	}
}


class ImageViewer extends Component {
	// @bind
	// toggle(e) {
	// 	this.setState({ full: !this.state.full });
	// 	if (e) return e.preventDefault(), e.stopPropagation(), false;
	// }

	render({ src }, { full }) {
		return <img src={src} style={{
			display: 'block',
			maxWidth: full?'auto':'',
			margin: 'auto'
		}} onClick={this.toggle} />;
	}
}


class VideoPlayer extends Component {
	@bind
	play(e) {
		this.setState({ play:true });
		noBubble(e);
	}

	@bind
	stop(e) {
		this.setState({ play:false });
		noBubble(e);
	}

	componentDidUpdate() {
		if (this.state.play) {
			setTimeout(() => this.base.querySelector('video').play(), 100);
		}
	}

	render({ src, posterSrc }, { play }) {
		return (
			<div class="video-player">
				<div class="poster" onClick={this.play}>
					<img src={posterSrc} />
					<Icon icon="play circle outline" />
				</div>
				{ play ? (
					<video src={src} onPause={this.stop} onEnd={this.stop} autoplay autobuffer autostart />
				) : null }
			</div>
		);
	}
}


class MusicPlayer extends Component {
	render({ title, spotifyData={} }) {
		let id = spotifyData && spotifyData.track && spotifyData.track.id,
			url = `https://embed.spotify.com/?uri=spotify:track:${encodeURIComponent(id)}`;
		return (
			<div class="music-player">
				<h6>{ title }</h6>
				{ id ? (
					<iframe src={url} frameborder="0" allowtransparency="true" style="width:100%; height:380px;" />
				) : null }
			</div>
		);
	}
}
