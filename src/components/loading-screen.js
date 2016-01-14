import { h, Component } from 'preact';
import { Spinner } from 'preact-mdl';

export default class LoadingScreen extends Component {
	shouldComponentUpdate({ overlay }) {
		return overlay !== this.overlay;
	}

	render({ overlay=true }) {
		this.overlay = overlay;
		return (
			<div class="loading" overlay={overlay || null }>
				<Spinner is-active single-color />
			</div>
		);
	}
}
