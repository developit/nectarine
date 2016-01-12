import { h, Component } from 'preact';
import { route } from 'preact-router';
import { Layout, Navigation, Button, Icon } from 'preact-mdl';
import { bind } from 'decko';
import store from '../store';
import { on, off } from '../pubsub';

export default class Sidebar extends Component {
	state = { displayName:'' };

	componentDidMount() {
		on('menu', this.open);
		on('route', this.close);
		store.subscribe(this.fromState);
		this.fromState(store.getState());
	}

	componentWillUnmount() {
		off('menu', this.open);
		off('route', this.close);
		store.unsubscribe(this.fromState);
	}

	@bind
	fromState({ profile:{ displayName }={} }={}) {
		if (displayName!==this.state.displayName) {
			this.setState({ displayName });
		}
	}

	@bind
	close() {
		this.base.classList.remove('is-visible');
		this.visible = false;
	}

	@bind
	open() {
		this.base.classList.add('is-visible');
		this.visible = true;
	}

	render({ }, { displayName }) {
		let { Link } = Navigation;
		return (
			<Layout.Drawer js={false} class={this.visible?'is-visible':null}>
				<Button class="menu" icon onClick={this.close}><Icon icon="menu" /></Button>
				<Layout.Title>{ displayName || ' ' }</Layout.Title>
				<Navigation>
					<Link href="/" route={route}>Home</Link>
					<Link href="/profile" route={route}>Profile</Link>
					<Link href="/stream" route={route}>Stream</Link>
					<Link href="/settings" route={route}>Settings</Link>
				</Navigation>
			</Layout.Drawer>
		);
	}
}
