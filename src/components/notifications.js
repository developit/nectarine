import { h, Component } from 'preact';
import { Button, Icon } from 'preact-mdl';
import { bind } from 'decko';
import peach from '../peach';

export default class Settings extends Component {
	componentDidMount() {
		this.update();
	}

	@bind
	update() {
		// connections, inboundFriendRequests, outboundFriendRequests
		peach.connections( (error, data) => {
			this.setState({ error, ...data });
		});
	}

	@bind
	acceptFriendRequest(id) {
		peach.acceptFriendRequest(id, error => {
			if (error) return this.setState({ error });
			this.setState({
				inboundFriendRequests: this.state.inboundFriendRequests.filter(r=>r.id!==id)
			});
			peach.updateConnections();
		});
	}

	render({}, { error, inboundFriendRequests=[], outboundFriendRequests=[] }) {
		return (
			<div class="notifications">
				<div class="scroll-list">{
					inboundFriendRequests.map( ({ id, stream }) => (
						<div class="scroll-list-item">
							<div class="avatar" style={`background-image: url(${stream.avatarSrc});`} />
							<button-bar>
								<Button icon accent ripple onClick={()=>this.acceptFriendRequest(id)}><Icon icon="check" /></Button>
							</button-bar>
							<h4>{ stream.displayName }</h4>
							<h5>@{ stream.name }</h5>
						</div>
					))
				}</div>
			</div>
		);
	}
}
