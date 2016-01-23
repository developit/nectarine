import { h, Component } from 'preact';
import { Layout, TextField, Button, Icon, Spinner } from 'preact-mdl';
import { bind, debounce } from 'decko';
import { parallel } from 'praline';
import chooseFiles from 'choose-files';
import canvasToBlob from 'canvas-to-blob';
import peach from '../peach';
import { on, off, emit } from '../pubsub';

const MAX_IMAGE_SIZE = 1000;

const CLEAN = {
	type: 'text',
	text: '',
	gifs: null,
	images: null,
	error: null,
	loading: false
};

export default class Create extends Component {
	state = { open:false, ...CLEAN };

	componentDidMount() {
		on('create', this.open);
	}

	componentWillUnmount() {
		off('create', this.open);
	}

	@bind
	open(props={}) {
		emit('track', 'create');
		this.setState({ open:true, ...CLEAN, ...props });
	}

	@bind
	close() {
		this.setState({ open:false });
	}

	@bind
	submit() {
		let { text, type, gifs, images, uploading, loading, selectedMagic } = this.state;
		if (loading || uploading) return alert('Still uploading...');
		if (!text && type==='text') return this.setState({ error:'Enter a message' });

		let post = [];

		text = text.replace(/^gif\s+(".*?"|[^\s]+)\s*/i, '');
		if (text) {
			post.push({ text, type });
		}

		if (gifs && (selectedMagic || selectedMagic===0)) {
			let img = gifs[selectedMagic].images.downsized;

			post.push({
				type: 'gif',
				src: img.url,
				width: img.width,
				height: img.height
			});
		}

		if (images && images.length) {
			post.push(...images.map( img => ({
				type: img.url.match(/\.gif$/i) ? 'gif' : 'image',
				src: img.url,
				width: img.width,
				height: img.height
			})));
		}

		//console.log(post);

		if (!post.length) return;

		this.setState({ loading:true });
		peach.post(post, (error, result) => {
			this.setState({ loading:false });
			if (error) return this.setState({ error });
			this.close();
			emit('did-post');
		});
	}

	componentDidUpdate({ }, { text='' }) {
		let p = text.match(/^gif\s+(".*?"|[^\s]+)/i);
		this.magicGif(p && p[1]);
	}

	@debounce(500)
	magicGif(terms) {
		if (terms===this.gifTerms) return;
		this.gifTerms = terms;
		// console.log(terms);
		if (!terms) return this.setState({ selectedMagic:null, gifs: null });
		fetch(`https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(terms)}&api_key=dc6zaTOxFJmzC`)
			.then( r => r.json() )
			.then( ({ data=[] }) => {
				this.setState({
					selectedMagic: null,
					gifs: data
				});
			});
	}

	@bind
	selectMagic(e) {
		let index = e.target.getAttribute('data-magic');
		this.setState({ selectedMagic:index });
	}

	@bind
	addImages() {
		chooseFiles( files => {
			if (!files || !files[0]) return;
			this.setState({ uploading:true });

			parallel(files.map(img => [this.uploadImage, img]), (error, ...images) => {
				if (!images.length) images = null;
				this.setState({ uploading:false, error, images });
			});
		});
	}

	uploadImage(img, callback) {
		let image = new Image(),
			url = URL.createObjectURL(img);
		setTimeout( () => URL.revokeObjectURL(url), 1000);
		image.src = url;
		image.onload = () => {
			let { width, height } = image;
			if (width>MAX_IMAGE_SIZE || height>MAX_IMAGE_SIZE) {
				let scale = MAX_IMAGE_SIZE / Math.max(width, height),
					canvas = document.createElement('canvas');
				canvas.width = width * scale;
				canvas.height = height * scale;
				let ctx = canvas.getContext('2d');
				ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
				canvasToBlob(
					canvas,
					blob => peach.uploadImage(blob, callback),
					'image/jpeg',
					0.9
				);
			}
			else {
				peach.uploadImage(img, callback);
			}
		};
		image.onerror = () => callback('Not a valid image');
	}

	render({ }, { open, text='', error, uploading, loading, images, gifs, selectedMagic }) {
		return (
			<div class="create modal" showing={open || null}>
				<Layout.Header manual>
					<Layout.HeaderRow>
						<Button icon onClick={this.close}><Icon icon="close" /></Button>
						<Layout.Title>New Post</Layout.Title>
						<Layout.Spacer />
						<Button icon onClick={this.addImages}>
							{ uploading ? <Spinner active /> : <Icon icon="add a photo" /> }
						</Button>
						<Layout.Spacer />
						<Button icon onClick={this.submit}>
							{ loading ? <Spinner active /> : <Icon icon="send" /> }
						</Button>
					</Layout.HeaderRow>
				</Layout.Header>
				<div class="content has-header" magic={!!gifs || null}>
					<div class="inner">
						<TextField class="text" multiline placeholder="Enter a message." value={text} onInput={this.linkState('text')} />

						<div class="magic">
							<div class="inner">
								{ gifs ? gifs.map( (p, i) => (
									<img
										data-magic={i}
										selected={(selectedMagic==i) || null}
										onClick={this.selectMagic}
										src={p.images.downsized.url} />
								)) : null }
							</div>
						</div>

						<div class="images">
							<div class="inner">
								{ images ? images.map( img => (
									<img src={img.url} />
								)) : null }
							</div>
						</div>
					</div>
					{ error ? <div class={{error:1, showing:error}}>{ error }</div> : null }
				</div>
			</div>
		);
	}
}
