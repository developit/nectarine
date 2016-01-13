import { h, Component } from 'preact';
import { Button } from 'preact-mdl';
import { bind, debounce } from 'decko';
import Post from './post';
import peach from '../peach';

const UPDATE_INTERVAL = 30;

export default class Stream extends Component {
	componentDidMount() {
		this.update();
		// @TODO: polling should be handled by peach-client and fire events / push state.
		this.timer = setInterval(this.update, UPDATE_INTERVAL*1000);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	@bind
	update() {
		peach.activity((error, stream) => {
			this.setState({ error, stream });
		});
	}

	render({}, { error, stream={} }) {
		return (
			<div class="stream view">
				<div class="posts">
					<div class="posts-inner">{
						(stream.activityItems || []).map( m => <Post minimal {...m} /> )
					}</div>
				</div>
			</div>
		);
	}
}
