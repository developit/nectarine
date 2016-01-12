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

	render({ }, { inboundFriendRequests=[] }) {
		this.inboundFriendRequests = inboundFriendRequests;
		//console.log('render', inboundFriendRequests);

		return (
			<Layout.Header manual>
				<Layout.HeaderRow>
					<Button icon onClick={this.toggleMenu}><Icon icon="menu" /></Button>
					<Layout.Title>
						<span style="cursor:pointer" onClick={this.linkTo('/')}>Peach</span>
					</Layout.Title>

					<Layout.Spacer />

					<Button icon style="overflow:visible" onClick={this.linkTo('/notifications')}>
						<Icon icon="notifications" badge={inboundFriendRequests.length || null} />
					</Button>

					{/*
					<TextField
						label="Documentation URL (JSON)"
						type="url"
						style="background-color:#FFF; box-shadow:0 0 0 3px #FFF; color:#000;"
						onKeyDown={ e => e.keyCode===13 ? load(e.target.value) : null }
						value={ docs && docs.url } />
					*/}
				</Layout.HeaderRow>
			</Layout.Header>
		);
	}
}
