import { h, Component } from 'preact';
import { Layout, Button, Icon, Spinner } from 'preact-mdl';
import { route } from 'preact-router';
import { memoize, bind } from 'decko';
import peach from '../peach';
import { emit } from '../pubsub';

const REDUCE = ({ connections, inboundFriendRequests, outboundFriendRequests }) =>
	({ connections, inboundFriendRequests, outboundFriendRequests });

export default class Header extends Component {
	constructor() {
		super();
		peach.store.subscribe( state => this.setState(REDUCE(state)) );

		this.state.loading = peach.isLoading();

		peach.on('loadstart', () => this.setState({ loading: true }) );
		peach.on('loadend', () => this.setState({ loading: false }) );
	}

	shouldComponentUpdate({}, { inboundFriendRequests, loading }) {
		return inboundFriendRequests!==this.inboundFriendRequests || loading!==this.loading;
	}

	@memoize
	linkTo(url) {
		return () => route(url);
	}

	@bind
	toggleMenu() {
		//peach.store.setState({ menu:true });
		emit('menu');
	}

	@bind
	addFriend() {
		let name = prompt(`Friend's name:`);
		if (!name) return;
		peach.addFriend(name, err => {
			if (err) alert(`Error: ${err}`);
			else alert('Friend request sent');
		});
	}

	@bind
	refresh() {
		emit('refresh');
	}

	render({ }, { loading=false, inboundFriendRequests=[] }) {
		this.inboundFriendRequests = inboundFriendRequests;
		this.loading = loading;

		return (
			<Layout.Header manual>
				<Layout.HeaderRow>
					<Button icon onClick={this.toggleMenu}><Icon icon="menu" /></Button>
					<Layout.Title>
						<span style="cursor:pointer;" onClick={this.linkTo('/')}>Nectarine</span>
					</Layout.Title>

					<Layout.Spacer />

					<Button icon onClick={this.refresh}>
						<span class="logo" loading={loading || null}>🍑</span>
					</Button>

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
