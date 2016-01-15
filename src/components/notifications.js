import { h, Component } from 'preact';
import { Button, Icon } from 'preact-mdl';
import { Link } from 'preact-router';
import { bind } from 'decko';
import { on, off, emit } from '../pubsub';
import peach from '../peach';

export default class Settings extends Component {
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
			if (error) return alert(`Error: ${error}`);
			let { accepted, inboundFriendRequests } = this.state;
			this.setState({
				accepted: inboundFriendRequests.filter( r => r.id===id ).concat(accepted || [])
			});
			peach.store.setState({
				inboundFriendRequests: (peach.store.getState().inboundFriendRequests || []).filter( r => r.id!==id )
			});
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

	render({}, { accepted=[], inboundFriendRequests=[], outboundFriendRequests=[] }) {
		let total = inboundFriendRequests.length + accepted.length;
		return (
			<div class="notifications">
				{ total ? (
					<div class="scroll-list">
						{ inboundFriendRequests.map( ({ id, stream }) => (
							<div class="scroll-list-item" onClick={this.toProfile(stream)}>
								<div class="avatar" style={`background-image: url(${stream.avatarSrc});`}  />
								<button-bar>
									<Button icon accent ripple onClick={e=>this.acceptFriendRequest(id,e)}><Icon icon="check" /></Button>
								</button-bar>
								<h4>{ stream.displayName }</h4>
								<h5>@{ stream.name }</h5>
							</div>
						)) }
						{ accepted.map( ({ id, stream }) => (
							<div class="scroll-list-item" onClick={this.toProfile(stream)} style="opacity:0.5">
								<div class="avatar" style={`background-image: url(${stream.avatarSrc});`}  />
								<h4>{ stream.displayName }</h4>
								<h5>@{ stream.name }</h5>
							</div>
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
