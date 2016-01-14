import { h, Component } from 'preact';
import { Layout, Button, Icon } from 'preact-mdl';
import { route } from 'preact-router';
import { memoize, bind } from 'decko';
import store from '../store';
import { emit } from '../pubsub';

const REDUCE = ({ connections, inboundFriendRequests, outboundFriendRequests }) =>
	({ connections, inboundFriendRequests, outboundFriendRequests });

export default class Header extends Component {
	constructor() {
		super();
		store.subscribe( state => this.setState(REDUCE(state)) );
	}

	shouldComponentUpdate({}, { inboundFriendRequests }) {
		return inboundFriendRequests!==this.inboundFriendRequests;
	}

	@memoize
	linkTo(url) {
		return () => route(url);
	}

	@bind
	toggleMenu() {
		//store.setState({ menu:true });
		emit('menu');
	}

	@bind
	addFriend() {
		let name = prompt(`Friend's name:`);
		if (!name) return;
		peach.addFriend(name, err => {
			if (err) alert(`Error: ${err}`);
		});
	}

	render({ }, { inboundFriendRequests=[] }) {
		this.inboundFriendRequests = inboundFriendRequests;

		return (
			<Layout.Header manual>
				<Layout.HeaderRow>
					<Button icon onClick={this.toggleMenu}><Icon icon="menu" /></Button>
					<Layout.Title>
						<span style="cursor:pointer" onClick={this.linkTo('/')}>Nectarine</span>
					</Layout.Title>

					<Layout.Spacer />

					<Button icon onClick={this.addFriend}>
						<Icon icon="person add" />
					</Button>

					<Button icon style="overflow:visible" onClick={this.linkTo('/notifications')}>
						<Icon icon="notifications" badge={inboundFriendRequests.length || null} />
					</Button>
				</Layout.HeaderRow>
			</Layout.Header>
		);
	}
}
