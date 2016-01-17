import { h, Component } from 'preact';
import { Layout } from 'preact-mdl';
import 'optimized-visibility';
import { bind, debounce } from 'decko';
import LoadingScreen from './loading-screen';
import Header from './header';
import Sidebar from './sidebar';
import Create from './create';
import Wave from './wave';
import Main from './main';
import Login from './login';
import peach from '../peach';

class LoggedIn extends Component {
	shouldComponentUpdate() {
		return false;
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

		this.bodyAttr('loaded', true);
		peach.store.subscribe(this.updateBackground);
		this.updateBackground(peach.store.getState());
	}

	componentWillUnmount() {
		store.unsubscribe(this.updateBackground);
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
