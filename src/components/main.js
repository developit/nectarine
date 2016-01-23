import { h, Component } from 'preact';
import { Layout, Button, Icon } from 'preact-mdl';
import Router, { route } from 'preact-router';
import { bind, debounce } from 'decko';
import Stream from './stream';
import { Connections, ExploreConnections } from './connections';
import Friends from './friends';
import Profile from './profile';
import Notifications from './notifications';
import Settings from './settings';
import { emit, on, off } from '../pubsub';

export default class App extends Component {
	shouldComponentUpdate() {
		return false;
	}

	componentWillMount() {
		on('go', this.go);
	}

	componentWillUnmount() {
		off('go', this.go);
	}

	@bind
	go(e) {
		route(e.url || e);
	}

	onRoute({ url }) {
		emit('route', { url });
		emit('track', url);
	}

	create() {
		emit('create');
	}

	@debounce
	handleScroll() {
		emit('update-visibility');
	}

	render() {
		return (
			<Layout.Content id="content" onScroll={this.handleScroll}>
				<Router onChange={::this.onRoute}>
					<Connections path="/" />
					<Friends path="/friends" />
					<ExploreConnections path="/explore" />
					<Stream path="/stream" />
					<Profile path="/profile" id="me" />
					<Profile path="/profile/:id" />
					<Notifications path="/notifications" />
					<Settings path="/settings" />
				</Router>

				<Button fab colored class="floating-action-button" onclick={this.create}>
					<Icon>create</Icon>
				</Button>
			</Layout.Content>
		);
	}
}
