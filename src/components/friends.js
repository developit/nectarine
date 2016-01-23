import { h, Component } from 'preact';
import Friend from './friend';

export default class Friends extends Component {
	state = {
		connections: [],
	};

	componentDidMount(){
		peach.updateConnections();
		this.setState({ connections: peach.store.getState().connections || [] });
	}

	render({}, { connections }){
		let content;

		if ( connections.length ){
			return (
				<div class="friends-list view view-scroll">
					<div class="friends">
						<div class="friends-inner">{
							connections.map( friend => <Friend {...friend} /> )
						}</div>
					</div>
				</div>
			);
		}

		else {
			return (
				<div class="explore view">
					<div class="inner">
						<div class="nothing">
							<p>Sorry, no one here yet.</p>
							<p>
								You seem to have no contact yet in Peach network. Hit the "add friend"
								button on top left and start adding some!
							</p>
						</div>
					</div>
				</div>
			);
		}
	}
}
