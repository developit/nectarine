import { h, Component } from 'preact';
import { Button } from 'preact-mdl';
import { bind, debounce } from 'decko';
import Post from './post';
import peach, { updateConnections } from '../peach';
import { on, off, emit } from '../pubsub';

const UPDATE_INTERVAL = 30;

const toId = ({ id, createdTime, body }) => (id || `${body.postID}-${createdTime}`);

export default class Stream extends Component {
	componentDidMount() {
		peach.store.subscribe(this.handleUpdate);
		this.handleUpdate(peach.store.getState());
		this.update();
		on('refresh', this.update);
	}

	componentWillUnmount() {
		peach.store.unsubscribe(this.handleUpdate);
		off('refresh', this.update);
	}

	@bind
	handleUpdate({ activityItems }) {
		if (activityItems && activityItems!==this.state.activityItems) {
			let ids = activityItems.map(toId).join(',');
			if (ids!==this.state.ids) {
				this.setState({ ids, activityItems });
			}
		}
	}

	@bind
	update() {
		updateConnections();
	}

	@debounce
	handleScroll() {
		emit('update-visibility');
	}

	componentDidUpdate() {
		emit('update-visibility');
	}

	render({}, { error, activityItems }) {
		return (
			<div class="stream view view-scroll" onScroll={this.handleScroll}>
				<div class="posts">
					<div class="posts-inner">{
						(activityItems || []).map( m => <Post minimal {...m} /> )
					}</div>
				</div>
			</div>
		);
	}
}
