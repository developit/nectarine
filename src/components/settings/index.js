import { h, Component } from 'preact';
import { Card, TextField, Button, Icon, Spinner, CheckBox } from 'preact-mdl';
import Preferences from './preferences';
import { bind } from 'decko';
import peach from '../../peach';
import chooseFiles from 'choose-files';

export default class Settings extends Component {
	componentDidMount() {
		this.update();
	}

	@bind
	update() {
		this.setState({ loading: true });
		peach.user.me( (error, { name, displayName, avatarSrc, isPublic }) => {
			let visibility = { friendsOnly: isPublic };
			this.setState({ loading:false, error, visibility, name, displayName, avatarSrc });
		});
	}

	@bind
	setVisibility(e) {
		let { visibility } = this.state;
		visibility.friendsOnly = e.target.checked;
		this.setState({ loading: true });
		peach.setVisibility(visibility, error => {
			this.setState({ loading:false, error, visibility });
		});
	}

	@bind
	setName() {
		this.set('name');
	}

	@bind
	setDisplayName() {
		this.set('displayName');
	}

	@bind
	set(what) {
		let v = this.state[what],
			n = 'set' + what.charAt(0).toUpperCase() + what.substring(1);
		this.setState({ loading: true });
		peach[n]({ [what]: v }, error => {
			this.setState({ loading: false, error });
			if (!error) {
				this.updateLocalProfile({ [what]: v });
			}
		});
	}

	updateLocalProfile(state) {
		peach.store.setState({
			profile: { ...peach.store.getState().profile || {}, ...state }
		});
	}

	@bind
	changeAvatar() {
		chooseFiles( files => {
			if (!files || !files[0]) return;
			this.setState({ loading:true });
			peach.uploadAvatar(files[0], (error, { avatarSrc }={}) => {
				this.setState({ loading:false, error });
				// console.log({ error, avatarSrc });
				if (!error && avatarSrc) {
					this.updateLocalProfile({ avatarSrc });
					this.setState({ avatarSrc });
				}
			});
		});
	}

	render({}, { loading, error, visibility={}, name, displayName, avatarSrc }) {
		return (
			<div class="settings">
				<Card shadow="2" class="centered has-image">
					<div style="position:absolute;right:10px;top:10px;">{ loading ? <Spinner /> : null }</div>

					<Card.Title>
						<Card.TitleText>Account Settings</Card.TitleText>
					</Card.Title>

					<Card.Text>
						<div class={{error:1, showing:error}}>{ error || ' ' }</div>

						<form action="javascript:">
							<CheckBox checked={visibility.friendsOnly} onChange={this.setVisibility}>Visible to Friends Only</CheckBox>
						</form>

						<form action="javascript:">
							<TextField
								floating-label
								label="Display Name"
								value={displayName}
								onInput={this.linkState('displayName')} />
							<Button colored raised onClick={this.setDisplayName}>Set Display Name</Button>
						</form>

						<form action="javascript:">
							<TextField
								floating-label
								label="Name"
								value={name}
								onInput={this.linkState('name')} />
							<Button colored raised onClick={this.setName}>Set Name</Button>
						</form>

						<form action="javascript:">
							<h6>Avatar</h6>
							<div class="avatar" onClick={this.changeAvatar} style={`background-image: url("${avatarSrc || '/assets/icon-300.png'}");`} />
							<Button colored raised onClick={this.changeAvatar}>Change</Button>
						</form>
					</Card.Text>
				</Card>

				<Preferences />
			</div>
		);
	}
}
