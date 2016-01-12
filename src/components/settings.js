import { h, Component } from 'preact';
import { Card, TextField, Button, Icon, Spinner, CheckBox } from 'preact-mdl';
import { bind } from 'decko';
import peach from '../peach';

export default class Settings extends Component {
	componentDidMount() {
		this.update();
	}

	@bind
	update() {
		// peach.getVisibility((error, visibility) => {
		// 	if (error) this.setState({ error });
		// 	this.setState({ visibility });
		// });
		this.setState({ loading: true });
		peach.user.me((error, { name, displayName, isPublic }) => {
			let visibility = { friendsOnly: isPublic };
			this.setState({ loading:false, error, visibility, name, displayName });
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
				let { profile={} } = peach.store.getState();
				profile[what] = v;
				peach.store.setState({ profile });
			}
		});
	}

	render({}, { loading, error, visibility={}, name, displayName }) {
		return (
			<div class="profile">
				<Card shadow="2" class="centered has-image">
					<div style="position:absolute;right:0;top:0">{ loading ? <Spinner /> : null }</div>

					<Card.Title>
						<Card.TitleText>Settings</Card.TitleText>
					</Card.Title>

					<Card.Text>
						{ error ? (
							<div class="error showing">{ error }</div>
						) : null }

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
					</Card.Text>
				</Card>
			</div>
		);
	}
}
