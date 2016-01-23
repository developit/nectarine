import { h, Component } from 'preact';
import { Button, Icon } from 'preact-mdl';
import { bind } from 'decko';
import { Link } from 'preact-router';
import Friend from './friend';
import peach from '../../peach';
import { emit, on, off } from '../../pubsub';

const toId = ({ id, createdTime, body }) => (id || `${body.postID}-${createdTime}`);

export default class Friends extends Component {
	state = {
		hasUpdated: false,
		connections: []
	};

	componentDidMount() {
		on('refresh', this.update);
		peach.store.subscribe(this.handleUpdate);
		this.handleUpdate(peach.store.getState());
		if (!this.lastUpdate || (Date.now()-this.lastUpdate)>30000) {
			this.update();
		}
	}

	componentWillUnmount() {
		off('refresh', this.update);
		peach.store.unsubscribe(this.handleUpdate);
	}

	@bind
	handleUpdate({ connections=[] }) {
		this.setState({ hasUpdated:true });
		if (connections && connections!==this.state.connections) {
			let ids = connections.map(toId).join(',');
			if (ids!==this.state.ids) {
				this.setState({ ids, connections });
			}
		}
	}

	@bind
	update() {
		this.lastUpdate = Date.now();
		peach.updateConnections();
	}

	renderNoFriends() {
		return (
			<div class="nothing">
				<p>You don&apos;t seem to have any Peach contacts.</p>
				<p>Find people in <Link href="/explore">Explore</Link>, or tap <Button icon><Icon icon="person add" /></Button> to add.</p>
			</div>
		);
	}

	render({}, { hasUpdated, connections }) {
		return (
			<div class="friends-list view view-scroll">
				<div class="friends">
					<div class="inner">
						{ connections.length ? (
							connections.map( friend => <Friend {...friend} /> )
						) : hasUpdated ? (
							this.renderNoFriends()
						) : null }
					</div>
				</div>
			</div>
		);
	}
}
