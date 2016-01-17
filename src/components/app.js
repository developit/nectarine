import { h, Component } from 'preact';
import { Layout } from 'preact-mdl';
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

		try {
			document.body.setAttribute('loaded', 'true');
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
