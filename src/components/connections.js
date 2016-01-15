import { h, Component } from 'preact';
import { Card, Button, Icon } from 'preact-mdl';
import { Link } from 'preact-router';
import { bind } from 'decko';
import Post from './post';
import LoadingScreen from './loading-screen';
import peach from '../peach';
import { emit, on, off } from '../pubsub';

export class Connections extends Component {
	counter = 0;
	explore = false;
	state = { loading: true };

	componentDidMount() {
		if (!this.lastUpdate || (Date.now()-this.lastUpdate)>30000) {
			this.update();
		}
		on('refresh', this.update);
	}

	componentWillUnmount() {
		off('refresh', this.update);
	}

	@bind
	update() {
		let id = ++this.counter,
			fn = this.explore ? peach.connections.explore : peach.connections;
		this.lastUpdate = Date.now();

		this.setState({ loading: true });
		fn( (error, { connections }) => {
			if (id!==this.counter) return;

			// seed the cache
			if (connections) connections.forEach(peach.cacheStream);

			this.setState({ loading:false, error, connections });
		});
	}

	linkTo(url) {
		return () => emit('go', { url });
	}

	render({}, { loading, error, connections=[] }) {
		if (!connections.length && !loading) return (
			<div class="explore view">
				<div class="inner">
					<div class="nothing">
						<p>Nothing to show.</p>
						<p>Let&apos;s go <Link href="/explore">Explore</Link>!</p>
					</div>
				</div>
			</div>
		);

		return (
			<div class="explore view">
				<div class="inner">
					{ connections.map( ({ id, displayName, posts=[], unreadPostCount=0, avatarSrc }) => (
						<Card shadow={2} class="centered stream-connection" onClick={this.linkTo(`/profile/${encodeURIComponent(id)}`)}>
							<Card.Title>
								<div class="avatar" style={`background-image: url(${avatarSrc});`} />
								<Card.TitleText>{ displayName } <span class="unread-count">({ unreadPostCount })</span></Card.TitleText>
							</Card.Title>
							<Card.Text>
								{ posts.length ? (
									<Post comment={false} {...posts[posts.length-1]} />
								) : null }
							</Card.Text>
						</Card>
					)) }
					{ !connections.length && loading ? <LoadingScreen overlay /> : null }
				</div>
			</div>
		);
	}
}


export class ExploreConnections extends Connections {
	explore = true;
}
