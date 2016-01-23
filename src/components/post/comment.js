import { h, Component } from 'preact';
import { Button, Icon, Menu } from 'preact-mdl';
import { bind } from 'decko';
import { renderer } from './renderers';
import peach from '../../peach';
import { emit } from '../../pubsub';

export default class Comment extends Component {
	constructor(props) {
		super(props);
		this.state = { deleted: false };
	}

	shouldComponentUpdate({ id }, { deleted }) {
		return id!==this.props.id || deleted!==this.deleted;
	}

	@bind
	handleClick(e) {
		let t = e.target;
		do {
			if (String(t.nodeName).toUpperCase()==='A' || String(t.className).match(/\bmdl-menu\b/)) return;
		} while( (t=t.parentNode) );
		this.props.onClick(this.props);
		return e.stopPropagation(), false;
	}

	@bind
	goAuthor(e) {
		let { author } = this.props;
		if (author && author.id) {
			peach.cacheStream(author);
			emit('go', { url:`/profile/${encodeURIComponent(author.id)}` });
		}
		if (e) e.stopPropagation(), e.preventDefault();
		return false;
	}

	@bind
	openMenu(e) {
		let menu = this.base.querySelector('.mdl-menu');
		if (menu) menu.MaterialMenu.toggle();
		if (e) e.stopPropagation(), e.preventDefault();
		return false;
	}

	@bind
	confirmDelete() {
		setTimeout( () => {
			if (confirm('Permanently delete this comment?')) this.delete();
		}, 200);
	}

	delete() {
		peach.deleteComment(this.props.id, err => {
			if (err) return alert(`Error: ${err}`);
			this.setState({ deleted: true });
		});
	}

	renderMenu() {
		let { id } = this.props;
		return (
			<span class="comment-menu-wrap">
				<Button id={`commentmenu-${id}`} class="comment-menu" onClick={this.openMenu} icon><Icon icon="more vert" /></Button>
				<Menu bottom-right for={`commentmenu-${id}`}>
					<Menu.Item onClick={this.confirmDelete}>Delete</Menu.Item>
				</Menu>
			</span>
		);
	}

	render({ id, author, body, allowDelete }, { deleted }) {
		this.deleted = deleted;

		if (deleted===true) return (
			<div class="comment comment-deleted">
				<p>Deleted</p>
			</div>
		);

		let mine = false,
			me = peach.store.getState().profile;
		if (author && me && author.id===me.id) {
			mine = allowDelete = true;
		}

		let avatar = author.avatarSrc;
		return (
			<div class="comment" onClick={this.handleClick}>
				{ allowDelete ? this.renderMenu() : <span class="comment-menu-wrap" /> }
				<div class="avatar" onClick={this.goAuthor} style={avatar ? `background-image: url(${avatar});` : null} />
				{ renderer('text')({ text:body }) }
				<author title={author.name}>{ author.displayName }</author>
			</div>
		);
	}
}
