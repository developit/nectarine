import { h, Component } from 'preact';
import { TextField, Button, Icon, Menu } from 'preact-mdl';
import neatime from 'neatime';
import { bind } from 'decko';
import { emit } from '../../pubsub';
import peach from '../../peach';
import Comment from './comment';
import { renderItem } from './renderers';
import optimisticHttps from 'optimistic-https';


const noBubble = e => {
	if (e) e.stopPropagation();
};


export default class Post extends Component {
	constructor(props) {
		super(props);
		this.state = { newComment: '', comments:[] };
	}

	@bind
	goAuthor(e) {
		let { author, body } = this.props,
			id = (author && author.id) || (body && body.authorStream && body.authorStream.id);
		if (id) {
			emit('go', { url:`/profile/${encodeURIComponent(id)}` });
		}
		noBubble(e);
		return false;
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
		this.setState({ liked });
		peach[liked?'like':'unlike'](id, err => {
			if (err) alert(`Error: ${err}`);
		});
		noBubble(e);
	}

	@bind
	clickComment({ author }) {
		this.setState({
			newComment: `@${author.name} ${this.state.newComment || ''}`
		});
		setTimeout(this.focusCommentField, 50);
	}

	@bind
	focusCommentField() {
		this.base.querySelector('.post-new-comment textarea').focus();
	}

	@bind
	maybeComment(e) {
		if (e && e.keyCode && e.keyCode===13) {
			return this.comment(e);
		}
	}

	@bind
	comment(e) {
		let { id } = this.props,
			{ newComment, comments=[] } = this.state,
			author = peach.store.getState().profile || {};
		if (newComment) {
			// comments.push({ author, body:newComment });
			// this.setState({ newComment: '', comments });
			peach.comment({
				postId: id,
				body: newComment
			}, (err, comment) => {
				if (err) return alert(`Error: ${err}`);
				comment.author = author;
				comments.push(comment);
				this.setState({ lastCommentedId: id, newComment: '', comments });
			});
		}
		e.preventDefault();
		return false;
	}

	componentWillReceiveProps({ id }) {
		let { lastComentedId, comments } = this.state;
		if (id!==lastComentedId && comments && comments.length) {
			this.setState({ lastComentedId:null, comments:[] });
		}
	}

	@bind
	confirmDelete() {
		setTimeout( () => {
			if (confirm('Permanently delete this post?')) this.delete();
		}, 200);
	}

	delete() {
		let { id } = this.props;
		peach.deletePost(id, err => {
			if (err) return alert(`Error: ${err}`);
			this.setState({ deleted: true });
		});
	}

	@bind
	openPostMenu(e) {
		let menu = this.base.querySelector(`.mdl-menu[for="postmenu-${this.props.id}"]`);
		if (menu) menu.MaterialMenu.toggle();
		return noBubble(e), false;
	}

	render({ id, comment=true, minimal=false, type, body, message, comments=[], author, authorId, createdTime }, { newComment, comments:stateComments, deleted }) {
		if (deleted===true) return <div class="post post-deleted" />;

		author = author || body && body.authorStream;
		let avatar = author && author.avatarSrc,
			isLiked = this.isLiked(),
			likeCount = this.likeCount(),
			isOwn = (!author && !authorId) || (authorId || author.id)===peach.store.getState().profile.id;

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
			<div class={'post type-'+type} minimal={minimal || null} has-avatar={!!author || null} is-own={isOwn || null}>
				{ author ? (
					<div class="avatar" onClick={this.goAuthor} style={avatar && `background-image: url(${optimisticHttps(avatar)});`} />
				) : null }
				<div class="post-meta">
					<span class="post-time">{ neatime(createdTime * 1000) }</span>
				</div>
				<div class="items">{
					message.map(renderItem)
				}</div>
			</div>
		);

		return (
			<div class={'post type-'+type} has-avatar={!!author || null} is-own={isOwn || null}>
				<div class="avatar" onClick={this.goAuthor} style={author ? `background-image: url(${optimisticHttps(avatar)});` : null} />

				<div class="post-meta">
					<span class="post-time">{ neatime(createdTime * 1000) }</span>

					{ isOwn ? (
						<span class="post-menu-wrap">
							<Button id={`postmenu-${id}`} class="post-menu" onClick={this.openPostMenu} icon><Icon icon="more vert" /></Button>
							<Menu bottom-right for={`postmenu-${id}`}>
								{/*<Menu.Item onClick={this.share}>Share</Menu.Item>*/}
								<Menu.Item onClick={this.confirmDelete}>Delete</Menu.Item>
							</Menu>
						</span>
					) : null }

					<Button icon class="like-unlike" is-liked={isLiked || null} onClick={this.toggleLike}>
						<Icon icon="favorite" badge={likeCount || null} />
					</Button>
				</div>

				<div class="items">{
					message.map(renderItem)
				}</div>

				{ comment!==false ? (
					<div class="comments" onClick={noBubble} onTouchStart={noBubble} onMouseDown={noBubble}>
						{ comments && comments.length ? (
							comments.map( comment => (
								<Comment
									allowDelete={isOwn}
									onClick={this.clickComment}
									{...comment}
								/>
							) )
						) : null }
					</div>
				) : null }
				{ comment!==false ? (
					<div class="post-new-comment" onClick={noBubble}>
						<TextField multiline placeholder="Witty remark" value={newComment || ''} onInput={this.linkState('newComment')} onKeyDown={this.maybeComment} />
						<Button icon onClick={this.comment}><Icon icon="send" /></Button>
					</div>
				) : null }
			</div>
		);
	}
}
