import { h, Component } from 'preact';
import { Spinner } from 'preact-mdl';

export default class LoadingScreen extends Component {
	shouldComponentUpdate() {
		return false;
	}

	render() {
		return (
			<div class="loading">
				<Spinner is-active single-color />
			</div>
		);
	}
}
