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
	go(e) {
		route(e);
		this.close();
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

	@bind
	me() {
		peach.addFriend('developit', () => this.go('/profile/77a03b2c4fa9460ea42ff4000558c18a'))
		return false;
	}

	render({ }, { displayName }) {
		let { Link } = Navigation;
		return (
			<Layout.Drawer js={false} class={this.visible?'is-visible':null}>
				<Button class="menu" icon onClick={this.close}><Icon icon="menu" /></Button>
				<Layout.Title>
					<Link href="/profile" route={this.go}>{ displayName || ' ' }</Link>
				</Layout.Title>
				<Navigation>
					<Link href="/" route={this.go}>Home</Link>
					<Link href="/friends" route={this.go}>Friends List</Link>
					<Link href="/explore" route={this.go}>Explore <em>Friends of Friends</em></Link>
					<Link href="/profile" route={this.go}>My Profile</Link>
					<Link href="/stream" route={this.go}>Stream</Link>
					<Link href="/settings" route={this.go}>Settings</Link>
					<div style="border-top:1px solid #DDD; margin:5px 0; height:0; padding:0; font-size:0;" />
					<Link onClick={this.me}>App by Jason 🚀</Link>
				</Navigation>
			</Layout.Drawer>
		);
	}
}
