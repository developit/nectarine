import { h, Component } from 'preact';
import { Layout } from 'preact-mdl';
import { bind, debounce } from 'decko';
import { updateAllVisibility } from 'optimized-visibility';
import LoadingScreen from './loading-screen';
import Header from './header';
import Sidebar from './sidebar';
import Create from './create';
import Wave from './wave';
import Main from './main';
import Login from './login';
import peach from '../peach';
import { init } from '../notify';
import { on, off } from '../pubsub';

class LoggedIn extends Component {
	shouldComponentUpdate() {
		return false;
	}

	componentDidMount() {
		init();
	}

	render() {
		return (
			<Layout fixed-header={true} js={false}>
				<Create />
				<Wave />
				<Sidebar />
				<Header />
				<Main />
			</Layout>
		);
	}
}

export default class App extends Component {
	state = {
		pending: true,
		loggedin: false
	};

	componentDidMount() {
		peach.init( () => this.setState({ pending:false }) );
		peach.on('login', () => this.setState({ loggedin:true }) );
		peach.on('logout', () => this.setState({ loggedin:false }) );

		on('update-visibility', this.updateVisibility);

		this.bodyAttr('loaded', true);
		peach.store.subscribe(this.updateBackground);
		this.updateBackground(peach.store.getState());
	}

	componentWillUnmount() {
		off('update-visibility', this.updateVisibility);
		peach.store.unsubscribe(this.updateBackground);
	}

	@debounce(500)
	updateVisibility() {
		updateAllVisibility();
	}

	@bind
	updateBackground({ prefs }) {
		let wb = prefs && prefs.plainBackground || false;
		if (wb!==this.plainBackground) {
			this.plainBackground = wb;
			this.bodyAttr('plain-background', wb);
		}
	}

	bodyAttr(key, value) {
		try {
			if (value===false) document.body.removeAttribute(key);
			else document.body.setAttribute(key, value);
		} catch(err) {}
	}

	render({}, { pending, loggedin }) {
		return (
			<div id="app">
				{ pending ? (
					<LoadingScreen />
				) : loggedin ? (
					<LoggedIn />
				) : (
					<Login />
				) }
			</div>
		);
	}
}
