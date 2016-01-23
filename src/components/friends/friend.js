import { h, Component } from 'preact';
import { bind } from 'decko';
import { emit } from '../../pubsub';

export default class Friends extends Component {
	@bind
	goAuthor(e) {
		let { id } = this.props;
		emit('go', { url:`/profile/${encodeURIComponent(id)}` });
	}

	render({ avatarSrc, bio, displayName, name, unreadPostCount }) {
		return (
			<div class="friend" unread-count={unreadPostCount || null} onClick={this.goAuthor}>
				<div class="avatar" style={avatarSrc ? `background-image: url('${avatarSrc}');` : null} />
				<h2>{displayName} <span class="unread-count">({ unreadPostCount || 0 })</span></h2>
				<h4>@{name}</h4>
				<footer>{bio || null}</footer>
			</div>
		);
	}
}
