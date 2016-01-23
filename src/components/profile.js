import { h, Component } from 'preact';
import { Button, Icon, Card } from 'preact-mdl';
import LoadingScreen from './loading-screen';
import { bind, debounce } from 'decko';
import { on, off, emit } from '../pubsub';
import Post from './post';
import peach from '../peach';

const EMPTY = {};

export default class Profile extends Component {
	_counter = 0;

	componentDidMount() {
		this.update();
		on('refresh', this.update);
		on('did-post', this.updateIfMe);
	}

	componentWillUnmount() {
		off('refresh', this.update);
		off('did-post', this.updateIfMe);
	}

	componentWillReceiveProps({ id }) {
		if (id!==this.state.id) this.update(id);
	}

	@bind
	updateIfMe() {
		let { id } = this.props,
			me = peach.store.getState().profile.id;
		if (id==='me' || id===me) {
			this.update();
		}
	}

	@bind
	update(id=this.props.id) {
		let myId = peach.store.getState().profile.id;
		id = id || 'me';
		if (id==='me') id = myId;

		if (this.state.loading===true && this.state.id===id) return;

		let cached = peach.streamCache[id],
			different = id!==this.state.id,
			loadingNew = different && !cached,
			c = ++this._counter;

		if (different) this.scrollToTop();

		this.setState({ id, error:null, loading: true, loadingNew, stream:cached || EMPTY, followPending:false });

		peach.user.stream({ id, optimistic:true }, (error, stream) => {
			if (c!==this._counter) return;
			this.setState({ loading:false, loadingNew:false, error, stream });
		});

		// in parallel
		if (id!=='me' && id!==myId) {
			peach.markAsRead(id);
		}
	}

	@debounce
	scrollToTop() {
		this.base.scrollTop = 0;
	}

	@bind
	wave(type) {
		emit('wave', { to: this.props.id });
	}

	@bind
	follow() {
		let { stream } = this.state;
		peach.addFriend(stream.name, error => {
			if (error) alert('Error: '+error);
			else this.setState({ followPending: true });
		});
	}

	@bind
	unfollow() {
		let { stream } = this.state;
		peach.removeFriend(stream.id, error => {
			if (error) alert('Error: '+error);
			this.setState({});
		});
	}

	private() {
		alert('This person\'s profile is only visible to friends.');
	}

	followsYou() {
		alert('This person follows you.');
	}

	@debounce
	handleScroll() {
		emit('update-visibility');
	}

	componentDidUpdate() {
		emit('update-visibility');
	}

	render({}, { error, loading, loadingNew, stream, followPending=false }) {
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

		if (!stream || !stream.name || (loading && loadingNew)) return (
			<div class="profile view">
				<LoadingScreen />
			</div>
		);

		let profile = peach.store.getState().profile || {},
			isMe = stream.name===profile.name;
		return (
			<div class="profile view view-scroll" onScroll={this.handleScroll}>
				<div class="inner">
					<header>
						<div class="avatar" style={stream.avatarSrc ? `background-image: url(${stream.avatarSrc});` : null} />

						<h4>@{ stream.name }</h4>
						<h3>{ stream.displayName }</h3>
						<small>{ stream.bio || null }</small>

						{ isMe ? null : (
							<div class="opts">
								{ isMe ? (
									<span class="tag is-you">You!</span>
								) : (
									<Button icon primary onClick={this.wave}>👋</Button>
								) }
								{ !isMe && stream.followsYou ? (
									<Button icon primary onClick={this.followsYou}>
										<Icon class="follows-you" icon="people" title="Follows You" />
									</Button>
								) : null }
								{ stream.isPublic ? null : (
									<Button icon primary onClick={this.private}>
										<Icon class="private" icon="lock" title="Private" />
									</Button>
								) }
								{ stream.youFollow ? (
									<Button primary class="unfollow" onClick={this.unfollow}>Unfollow</Button>
								) : (
									<Button primary class="follow" disabled={followPending || null} onClick={this.follow}>Follow</Button>
								) }
							</div>
						) }
					</header>

					<div class="posts">
						<div class="posts-inner">{
							(stream.posts || []).slice().reverse().map( post => <Post authorId={stream.id} {...post} /> )
						}</div>
					</div>

					{ loading ? <LoadingScreen overlay={false} /> : null }
				</div>
			</div>
		);
	}
}
