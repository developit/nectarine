import { h, Component } from 'preact';
import { Card, Button, Icon } from 'preact-mdl';
import { Link } from 'preact-router';
import { bind, memoize, debounce } from 'decko';
import Post from '../post';
import Connection from './connection';
import LoadingScreen from '../loading-screen';
import peach from '../../peach';
import { emit, on, off } from '../../pubsub';

const EMPTY = {};

export class Connections extends Component {
	counter = 0;
	explore = false;
	state = { loading: true };

	componentDidMount() {
		if (!this.lastUpdate || (Date.now()-this.lastUpdate)>30000) {
			this.update();
		}
		else if (!this.explore && peach.store.getState().connections) {
			this.update();
		}
		on('refresh', this.forceUpdate);
	}

	componentWillUnmount() {
		off('refresh', this.forceUpdate);
	}

	@bind
	forceUpdate() {
		this.update({ force:true });
	}

	@bind
	update({ force=false }=EMPTY) {
		let id = ++this.counter,
			{ connections } = peach.store.getState();
		this.lastUpdate = Date.now();

		if (!this.explore && !force && connections && connections.length) {
			// seed the cache
			connections.forEach(peach.cacheStream);
			this.setState({ loading:false, connections });
			return;
		}

		this.setState({ loading: true });

		let fn = this.explore ? peach.connections.explore : peach.connections;
		fn( (error, { connections }) => {
			if (id!==this.counter) return;

			// seed the cache
			if (connections) connections.forEach(peach.cacheStream);

			this.setState({ loading:false, error, connections });
		});
	}

	@memoize
	linkTo(url) {
		return () => emit('go', { url });
	}

	@debounce
	handleScroll() {
		emit('update-visibility');
	}

	componentDidUpdate() {
		emit('update-visibility');
	}

	render({}, { loading, error, connections=[] }) {
		// filter out connections who have not posted since reading.
		connections = connections.filter( c => c.unreadPostCount!==0 );

		// truncate after 50 posts if needed
		let { prefs } = peach.store.getState();
		if (prefs && prefs.limit && connections.length>50) {
			connections.length = 50;
		}

		if (!connections.length && !loading) return (
			<div class="explore view">
				<div class="inner">
					<div class="nothing">
						<p>Nothing new here.</p>
						<p>Go <Link href="/explore">Explore</Link>, or <Link href="/friends">view older posts from friends</Link>.</p>
					</div>
				</div>
			</div>
		);

		return (
			<div class="explore view" onScroll={this.handleScroll}>
				<div class="inner">
					{ connections.map( connection => (
						<Connection {...connection} meta={!this.explore} onClick={this.linkTo(`/profile/${encodeURIComponent(connection.id)}`)} />
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
