import { h, Component } from 'preact';
import { Icon } from 'preact-mdl';
import { bind } from 'decko';

export default class VideoPlayer extends Component {
	shouldComponentUpdate({ src, posterSrc }, { play }) {
		let { props } = this;
		return src!==props.src || posterSrc!==props.posterSrc || play!==this.play;
	}

	@bind
	play(e) {
		this.setState({ play:true });
		setTimeout(() => this.base.querySelector('video').play(), 50);
		if (e) e.stopPropagation();
		return false;
	}

	@bind
	stop(e) {
		this.setState({ play:false });
		if (e) e.stopPropagation();
		return false;
	}

	componentDidUpdate() {
		if (this.state.play) {
			setTimeout(() => this.base.querySelector('video').play(), 100);
		}
	}

	render({ src, posterSrc }, { play }) {
		this.playing = play;

		return (
			<div class="video-player" optimized-visibility>
				<div class="poster" onClick={this.play}>
					<img src={posterSrc} />
					<Icon icon="play circle outline" />
				</div>
				{ play ? (
					<video src={src} onPause={this.stop} onEnd={this.stop} autoplay autobuffer autostart />
				) : null }
			</div>
		);
	}
}
