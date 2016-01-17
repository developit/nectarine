import { h, Component } from 'preact';
import { bind } from 'decko';

// @TODO use a placeholder/poster image and clicking brings in the spotify embed (for performance)


export default class MusicPlayer extends Component {
	shouldComponentUpdate({ id, title, spotifyData }) {
		let { props } = this;
		return id!==props.id || title!==props.title || this.getId(spotifyData)!==this.getId(props.spotifyData);
	}

	getId(spotifyData) {
		return spotifyData && spotifyData.track && spotifyData.track.id;
	}

	render({ title, spotifyData }) {
		let id = this.getId(spotifyData),
			url = `https://embed.spotify.com/?uri=spotify:track:${encodeURIComponent(id)}`;
		return (
			<div class="music-player">
				<h6>{ title }</h6>
				<div class="music-player-inner" optimized-visibility more-optimized style="width:100%; height:380px;">
					{ id ? (
						<iframe src={url} frameborder="0" allowtransparency="true" style="width:100%; height:380px;" />
					) : null }
				</div>
			</div>
		);
	}
}
