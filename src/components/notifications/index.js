import { h, Component } from 'preact';
import { Link } from 'preact-router';
import ConnectionRequest from './connection-request';
import { bind } from 'decko';
import { on, off, emit } from '../../pubsub';
import peach from '../../peach';

const toId = ({ id, createdTime, body }) => (id || `${body.postID}-${createdTime}`);

export default class Notifications extends Component {
	componentDidMount() {
		peach.store.subscribe(this.handleUpdate);
		this.handleUpdate(peach.store.getState());
		this.update();
		on('refresh', this.update);
	}

	componentWillUnmount() {
		peach.store.unsubscribe(this.handleUpdate);
		off('refresh', this.update);
	}

	@bind
	handleUpdate({ inboundFriendRequests }) {
		if (inboundFriendRequests && inboundFriendRequests!==this.state.inboundFriendRequests) {
			let ids = inboundFriendRequests.map(toId).join(',');
			if (ids!==this.state.ids) {
				this.setState({ ids, inboundFriendRequests });
			}
		}
	}

	@bind
	update() {
		peach.updateConnections();
	}

	@bind
	onAcceptOrDeny(id) {
		let { accepted, inboundFriendRequests } = this.state;
		this.setState({
			accepted: inboundFriendRequests.filter( r => r.id===id ).concat(accepted || [])
		});
		peach.store.setState({
			inboundFriendRequests: (peach.store.getState().inboundFriendRequests || []).filter( r => r.id!==id )
		});
	}

	render({}, { accepted=[], inboundFriendRequests=[], outboundFriendRequests=[] }) {
		let total = inboundFriendRequests.length + accepted.length;
		return (
			<div class="notifications">
				{ total ? (
					<div class="scroll-list">
						{ inboundFriendRequests.map( ({ id, stream }) => (
							<ConnectionRequest id={id} stream={stream} onAct={this.onAcceptOrDeny} />
						)) }
						{ accepted.map( ({ id, stream }) => (
							<ConnectionRequest id={id} stream={stream} acted />
						)) }

						<div class="nothing">
							<p>There&apos;s more stuff in <Link href="/stream">your stream</Link>.</p>
						</div>
					</div>
				) : (
					<div class="nothing">
						<p>No new notifications!</p>
						<p>There&apos;s more stuff in <Link href="/stream">your stream</Link>.</p>
					</div>
				) }
			</div>
		);
	}
}
