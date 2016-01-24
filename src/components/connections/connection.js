import { h, Component } from 'preact';
import { Card, Button, Icon } from 'preact-mdl';
import { bind } from 'decko';
import Post from '../post';
import peach from '../../peach';

export default class Connection extends Component {
	constructor() {
		super();
		this.read = null;
	}

	shouldComponentUpdate(props, { read }) {
		for (let i in props) if (i!=='posts' && i!=='_fetched' && props[i]!==this.props[i]) return true;
		return read!==this.read;
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
		} while( (t=t.parentNode) );
		this.props.onClick(e);
	}

	@bind
	markRead(e) {
		peach.markAsRead(this.props.id);
		this.setState({ read:true });
		if (e) e.stopPropagation();
		return false;
	}

	render({ id, displayName, posts=[], unreadPostCount=0, avatarSrc, meta }, { read }) {
		this.read = read;
		//  key={key}
		return (
			<Card shadow={2} read={read || null} class="centered stream-connection" onClick={this.onClick}>
				<Card.Title>
					<div class="avatar" style={`background-image: url(${avatarSrc});`} />
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
