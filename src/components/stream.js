import { h, Component } from 'preact';
import { Button } from 'preact-mdl';
import { bind, debounce } from 'decko';
import Post from './post';
import peach from '../peach';
import { on, off, emit } from '../pubsub';

const UPDATE_INTERVAL = 30;

export default class Stream extends Component {
	componentDidMount() {
		this.update();
		// @TODO: polling should be handled by peach-client and fire events / push state.
		this.timer = setInterval(this.update, UPDATE_INTERVAL*1000);
		on('refresh', this.update);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
		off('refresh', this.update);
	}

	@bind
	update() {
		peach.activity((error, stream) => {
			this.setState({ error, stream });
		});
	}

	@debounce
	handleScroll() {
		emit('update-visibility');
	}

	render({}, { error, stream={} }) {
		return (
			<div class="stream view view-scroll" onScroll={this.handleScroll}>
				<div class="posts">
					<div class="posts-inner">{
						(stream.activityItems || []).map( m => <Post minimal {...m} /> )
					}</div>
				</div>
			</div>
		);
	}
}
