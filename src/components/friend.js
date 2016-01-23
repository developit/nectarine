import { h, Component } from 'preact';
import { bind } from 'decko';
import { emit } from '../pubsub';

export default class Friends extends Component {
	@bind
	goAuthor(e) {
		let { id } = this.props;
		emit('go', { url:`/profile/${encodeURIComponent(id)}` });
	}

	render({ avatarSrc, bio, displayName, name, unreadPostCount }){
		let border = unreadPostCount ? '#25d87a' : '#fff';

		return (
			<div class="friend mdl-grid" onClick={this.goAuthor}>
				<div class="mdl-cell mdl-cell--2-col mdl-cell--1-col-phone mdl-cell--1-col-tablet">
					<div class="avatar" style={`background-image: url(${avatarSrc}); border: 3px solid ${border}`} />
				</div>
				<div class="mdl-cell mdl-cell--10-col mdl-cell--3-col-phone mdl-cell--5-col-tablet">
					<h2>{displayName} <em>@{name}</em></h2>
					<footer>{bio}</footer>
				</div>
			</div>
		);
	}
}

