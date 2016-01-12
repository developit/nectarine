import { h, Component } from 'preact';
import { Card } from 'preact-mdl';
import { bind } from 'decko';
import Post from './post';
import peach from '../peach';
import { emit } from '../pubsub';

export default class Explore extends Component {
	componentDidMount() {
		this.update();
	}

	@bind
	update() {
		peach.connections.explore( (error, { connections }) => {
			if (connections) {
				let { streamCache } = peach.store.getState();
				connections.forEach( stream => {
					streamCache[stream.id] = { ...stream, _fetched:Date.now() }
				});
				peach.store.setState({ streamCache });
			}
			this.setState({ error, connections });
		});
	}

	linkTo(url) {
		return () => emit('go', { url });
	}

	render({}, { error, connections=[] }) {
		return (
			<div class="explore view">
				<div class="inner">{
					connections.map( ({ id, displayName, posts=[], unreadPostCount=0, avatarSrc }) => (
						<Card shadow={2} class="centered stream-connection" onClick={this.linkTo(`/profile/${encodeURIComponent(id)}`)}>
							<Card.Title>
								<div class="avatar" style={`background-image: url(${avatarSrc});`} />
								<Card.TitleText>{ displayName } ({ unreadPostCount })</Card.TitleText>
							</Card.Title>
							<Card.Text>
								{ posts[0] ? (
									<Post {...posts[0]} />
								) : null }
							</Card.Text>
						</Card>
					))
				}</div>
			</div>
		);
	}
}
