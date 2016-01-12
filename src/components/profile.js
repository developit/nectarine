import { h, Component } from 'preact';
import { Button, Icon, Card } from 'preact-mdl';
import LoadingScreen from './loading-screen';
import { bind, debounce } from 'decko';
import Post from './post';
import peach from '../peach';

export default class Profile extends Component {
	componentDidMount() {
		this.update();
	}

	componentWillReceiveProps({ id }) {
		if (id!==this.props.id) this.update(id);
	}

	@bind
	update(id=this.props.id) {
		id = id || 'me';
		// if (!id) return;
		peach.user.stream(id, (error, stream) => {
			this.setState({ error, stream });
			// this.scrollToBottom();
		});
	}

	// @debounce
	// scrollToBottom() {
	// 	let div = this.base.querySelector('.messages');
	// 	div.scrollTop = div.scrollHeight || 99999;
	// }

	// @bind
	// send() {
	// 	let { text } = this.state;
	// 	api.sendMessage({ text }, err => {
	// 		if (err) console.error(err);
	// 		else {
	// 			let { timeline } = this.state,
	// 				from = store.data.session.user.email;
	// 			timeline.push({ text, from });
	// 			this.setState({ timeline, text:'' });
	// 			this.scrollToBottom();
	// 		}
	// 	});
	// }

	@bind
	wave() {
		peach.wave(this.props.id, 'wave', error => {
			if (error) alert('Error: '+error);
		});
	}

	@bind
	follow() {
		let { stream } = this.state;
		peach.addFriend(stream.name, error => {
			if (error) alert('Error: '+error);
		});
	}

	@bind
	unfollow() {
		let { stream } = this.state;
		peach.removeFriend(stream.name, error => {
			if (error) alert('Error: '+error);
		});
	}

	private() {
		alert('This person\'s profile is only visible to friends.');
	}

	followsYou() {
		alert('This person follows you.');
	}

	render({}, { error, stream }) {
		if (error) return (
			<div class="profile view">
				<Card shadow={2} class="centered">
					<Card.Title>
						<Card.TitleText>Error</Card.TitleText>
					</Card.Title>
					<Card.Text>{ error }</Card.Text>
				</Card>
			</div>
		);

		if (!stream) return (
			<div class="profile view">
				<LoadingScreen />
			</div>
		);

		let profile = peach.store.getState().profile || {},
			isMe = stream.name===profile.name;
		return (
			<div class="profile view">
				<header>
					<div class="avatar" style={stream.avatarSrc ? `background-image: url(${stream.avatarSrc});` : null} />

					<h4>@{ stream.name }</h4>
					<h3>{ stream.displayName }</h3>

					{ isMe ? null : (
						<div class="opts">
							{ isMe ? (
								<span class="tag is-you">You!</span>
							) : (
								<Button icon onClick={this.wave}>
									<Icon icon="mood" title="Wave" />
								</Button>
							) }
							{ !isMe && stream.followsYou ? (
								<Button icon onClick={this.followsYou}>
									<Icon class="follows-you" icon="people" title="Follows You" />
								</Button>
							) : null }
							{ stream.isPublic ? null : (
								<Button icon onClick={this.private}>
									<Icon class="private" icon="lock" title="Private" />
								</Button>
							) }
							{ stream.youFollow ? (
								<Button accent class="unfollow" onClick={this.unfollow}>Unfollow</Button>
							) : (
								<Button primary class="follow" onClick={this.follow}>Follow</Button>
							) }
						</div>
					) }
				</header>

				<div class="posts">
					<div class="posts-inner">{
						(stream.posts || []).map( post => <Post {...post} /> )
					}</div>
				</div>
			</div>
		);
	}
}
