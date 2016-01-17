import { h, Component } from 'preact';
import { Layout, Button, Icon } from 'preact-mdl';
import Router, { route } from 'preact-router';
import { bind } from 'decko';
import Stream from './stream';
import { Connections, ExploreConnections } from './connections';
import Profile from './profile';
import Notifications from './notifications';
import Settings from './settings';
import store from '../store';
import { emit, on, off } from '../pubsub';

export default class App extends Component {
	shouldComponentUpdate() {
		return false;
	}

	componentWillMount() {
		on('go', this.go);
		store.subscribe(this.updateBackground);
		this.updateBackground(store.getState());
	}

	componentWillUnmount() {
		off('go', this.go);
		store.unsubscribe(this.updateBackground);
	}

	@bind
	updateBackground({ prefs }) {
		let wb = prefs.plainBackground || false;
		if (wb!==this.plainBackground) {
			this.plainBackground = wb;
			if (wb) this.base.setAttribute('plain-background', true);
			else this.base.removeAttribute('plain-background');
		}
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

	render() {
		return (
			<Layout.Content id="content">
				<Router onChange={::this.onRoute}>
					<Connections path="/" />
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
