import { h, Component } from 'preact';
import { Card, Button, CheckBox } from 'preact-mdl';
import { bind } from 'decko';
import peach from '../../peach';

export default class Preferences extends Component {
	transformOut({ limit, ...prefs }) {
		prefs.limit = limit ? 50 : false;
		return prefs;
	}

	transformIn({ limit, ...prefs }) {
		prefs.limit = !!limit;
		return prefs;
	}

	componentWillMount() {
		let prefs = this.transformIn(peach.store.getState().prefs || {});
		this.setState(prefs);
	}

	componentWillUpdate({}, prefs) {
		prefs = this.transformOut(prefs);
		peach.store.setState({ prefs });
	}

	getCacheSize() {
		let size = (localStorage.getItem('peach-client') || '').length / 1000;
		if (size > 1500) return (size/1000).toFixed(2) + 'mb';
		return Math.round(size) + 'kb';
	}

	@bind
	clearCache() {
		let { data } = peach.store,
			preserve = ['id', 'email', 'password', 'token', 'prefs', 'profile'];
		for (let i in data) {
			if (data.hasOwnProperty(i) && data[i] && preserve.indexOf(i)<0) {
				if (Array.isArray(data[i])) {
					data[i] = [];
				}
				else if (typeof data[i]==='object') {
					data[i] = {};
				}
				else {
					console.warn(`Unknown cache value ${i} (${typeof data[i]})`);
				}
			}
		}
		peach.store.setState({});
		setTimeout(() => this.setState({}), 750);
	}

	@bind
	logout() {
		if (!confirm('Really sign out?')) return;
		localStorage.removeItem('peach-client');
		location.href = '/';
	}

	render({ }, { limit, plainBackground, showNotifications=true }) {
		return (
			<Card shadow="2" class="centered">
				<Card.Title>
					<Card.TitleText>App Settings</Card.TitleText>
				</Card.Title>
				<Card.Text class="byline">
					These only apply to this device.
				</Card.Text>
				<Card.Text>
					<form action="javascript:;">
						<CheckBox checked={limit} onChange={this.linkState('limit')}>Limit to 50 unread updates</CheckBox>
					</form>
					<form action="javascript:;">
						<CheckBox checked={showNotifications} onChange={this.linkState('showNotifications')}>Show Notifications?</CheckBox>
					</form>
					<form action="javascript:;">
						<CheckBox checked={plainBackground} onChange={this.linkState('plainBackground')}>Plain background</CheckBox>
					</form>
					<form action="javascript:;">
						<p>Cache Data: {this.getCacheSize()}</p>
						<Button colored onClick={this.clearCache}>Clear Cache</Button>
					</form>
					<form action="javascript:;">
						<p>Done Exploring?</p>
						<Button colored onClick={this.logout}>Sign Out</Button>
					</form>
				</Card.Text>
			</Card>
		);
	}
}
