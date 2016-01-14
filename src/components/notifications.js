import { h, Component } from 'preact';
import { Button, Icon } from 'preact-mdl';
import { bind } from 'decko';
import { emit } from '../pubsub';
import peach from '../peach';

export default class Settings extends Component {
	componentDidMount() {
		peach.store.subscribe(this.handleUpdate);
		this.handleUpdate(peach.store.getState());
		this.update();
	}

	componentWillUnmount() {
		peach.store.unsubscribe(this.handleUpdate);
	}

	@bind
	handleUpdate({ inboundFriendRequests }) {
		if (inboundFriendRequests && inboundFriendRequests!==this.state.inboundFriendRequests) {
			this.setState({ inboundFriendRequests });
		}
	}

	@bind
	update() {
		peach.updateConnections();
	}

	@bind
	acceptFriendRequest(id, e) {
		peach.acceptFriendRequest(id, error => {
			if (error) return this.setState({ error });
			this.setState({
				inboundFriendRequests: this.state.inboundFriendRequests.filter(r=>r.id!==id)
			});
			peach.updateConnections();
		});
		if (e) e.stopPropagation();
	}

	@bind
	toProfile(stream) {
		return e => {
			peach.cacheStream(stream);
			emit('go', `/profile/${stream.id}`);
			return false;
		};
	}

	render({}, { error, inboundFriendRequests=[], outboundFriendRequests=[] }) {
		console.log(inboundFriendRequests);
		return (
			<div class="notifications">
				{ inboundFriendRequests.length ? (
					<div class="scroll-list">{
						inboundFriendRequests.map( ({ id, stream }) => (
							<div class="scroll-list-item" onClick={this.toProfile(stream)}>
								<div class="avatar" style={`background-image: url(${stream.avatarSrc});`}  />
								<button-bar>
									<Button icon accent ripple onClick={e=>this.acceptFriendRequest(id,e)}><Icon icon="check" /></Button>
								</button-bar>
								<h4>{ stream.displayName }</h4>
								<h5>@{ stream.name }</h5>
							</div>
						))
					}</div>
				) : (
					<p class="nothing">Nothing to do here!</p>
				) }
			</div>
		);
	}
}
