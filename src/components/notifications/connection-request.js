import { h, Component } from 'preact';
import { Button, Icon } from 'preact-mdl';
import { bind } from 'decko';
import { emit } from '../../pubsub';
import peach from '../../peach';

export default class ConnectionRequest extends Component {
	@bind
	accept(e) {
		this.act('accept');
		return e.stopPropagation(), false;
	}

	@bind
	deny(e) {
		this.act('deny');
		return e.stopPropagation(), false;
	}

	act(method) {
		let { id, onAct } = this.props;
		onAct(id);
		peach[method+'FriendRequest'](id, err => {
			if (err) return alert(`Error: ${err}`);
		});
	}

	@bind
	toProfile(e) {
		let { stream } = this.props;
		peach.cacheStream(stream);
		emit('go', `/profile/${stream.id}`);
		return false;
	}

	render({ id, stream, onAct, acted=false, ...props }) {
		return (
			<div class="scroll-list-item" onClick={this.toProfile} style={acted ? 'opacity:0.5' : null} {...props}>
				<div class="avatar" style={stream.avatarSrc ? `background-image: url(${stream.avatarSrc});` : null}  />
				{ acted ? null : (
					<button-bar>
						<Button icon colored ripple onClick={this.deny}><Icon icon="clear" /></Button>
						<Button icon accent ripple onClick={this.accept}><Icon icon="check" /></Button>
					</button-bar>
				) }
				<h4>{ stream.displayName }</h4>
				<h5>@{ stream.name }</h5>
			</div>
		);
	}
}
