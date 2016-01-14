import { h, Component } from 'preact';
import { Card, Button, Icon } from 'preact-mdl';
import { bind } from 'decko';
import Post from './post';
import LoadingScreen from './loading-screen';
import peach from '../peach';
import { emit } from '../pubsub';

export class Connections extends Component {
	counter = 0;
	explore = false;
	state = { loading: true };

	componentDidMount() {
		if (!this.lastUpdate || (Date.now()-this.lastUpdate)>30000) {
			this.update();
		}
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

	@bind
	followPeach() {
		peach.addFriend('peach', () => {
			if (!this.explore) emit('go', { url:'/explore' });
			else this.update()
		});
	}

	render({}, { loading, error, connections=[] }) {
		if (!connections.length && !loading) return (
			<div class="explore view">
				<div class="inner">
					<div class="nothing">
						<p>Nothing to show.</p>
						<p>Tap <Button icon colored><Icon icon="person add" /></Button> to add a friend.</p>
						<p>Or <Button colored onClick={this.followPeach}>Follow @peach</Button></p>
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
								<Card.TitleText>{ displayName } ({ unreadPostCount })</Card.TitleText>
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
