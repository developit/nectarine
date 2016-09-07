import { h, Component } from 'preact';
import { Card, Button, Icon } from 'preact-mdl';
import { bind } from 'decko';
import Post from '../post';

export default class Connection extends Component {
	shouldComponentUpdate(props, { read }) {
		for (let i in props) if (i!=='posts' && i!=='_fetched' && props[i]!==this.props[i]) return true;
		return false;
	}

	componentWillReceiveProps({ id }) {
		if (id!==this.props.id) this.read = null;
	}

	@bind
	onClick(e) {
		let t = e.target;
		do {
			if (String(t.nodeName).toUpperCase()==='A') {
				e.stopPropagation();
				return;
			}
		} while ((t=t.parentNode));
		this.props.onClick(e);
	}

	@bind
	markRead(e) {
		let { id, onRead } = this.props;
		if (onRead) onRead(id);
		if (e) e.stopPropagation();
		return false;
	}

	render({ id, displayName, posts=[], unreadPostCount=0, avatarSrc, meta }) {
		return (
			<Card shadow={2} class="centered stream-connection" onClick={this.onClick}>
				<Card.Title>
					<div class="avatar" style={avatarSrc && `background-image: url(${avatarSrc});`} />
					<Card.TitleText>{ displayName } <span class="unread-count">({ unreadPostCount || 0 })</span></Card.TitleText>
					{ meta ? (
						<div class="connection-meta">
							<Button icon onClick={this.markRead}><Icon icon="done" /></Button>
						</div>
					) : null }
				</Card.Title>
				<Card.Text>
					{ posts.length ? (
						<Post comment={false} authorId={id} {...posts[posts.length-1]} />
					) : null }
				</Card.Text>
			</Card>
		);
	}
}
