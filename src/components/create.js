import { h, Component } from 'preact';
import { Layout, TextField, Button, Icon, Spinner } from 'preact-mdl';
import { bind, debounce } from 'decko';
import { on, off, emit } from '../pubsub';

const CLEAN = {
	type: 'text',
	text: '',
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
		let { text, type, images, selectedMagic } = this.state;
		if (!text && type==='text') return this.setState({ error:'Enter a message' });

		let post = [];

		text = text.replace(/^gif\s+(".*?"|[^\s]+)\s*/i, '');
		if (text) {
			post.push({ text, type });
		}

		if (images && (selectedMagic || selectedMagic===0)) {
			let img = images[selectedMagic].images.downsized;
			//`https://media3.giphy.com/media/${encodeURIComponent(img.id)}/giphy.gif`;

			post.push({
				type: 'gif',
				src: img.url,
				width: img.width,
				height: img.height
			});
		}

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
		if (!terms) return this.setState({ selectedMagic:null, images: null });
		fetch(`https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(terms)}&api_key=dc6zaTOxFJmzC`)
			.then( r => r.json() )
			.then( ({ data=[] }) => {
				this.setState({
					selectedMagic: null,
					images: data
				});
			});
	}

	@bind
	selectMagic(e) {
		let index = e.target.getAttribute('data-magic');
		this.setState({ selectedMagic:index });
	}

	render({ }, { open, text='', error, loading, images, selectedMagic }) {
		return (
			<div class="create modal" showing={open || null}>
				<Layout.Header manual>
					<Layout.HeaderRow>
						<Button icon onClick={this.close}><Icon icon="close" /></Button>
						<Layout.Title>New Post</Layout.Title>
						<Layout.Spacer />
						<Button icon onClick={this.submit}>
							{ loading ? <Spinner active /> : <Icon icon="send" /> }
						</Button>
					</Layout.HeaderRow>
				</Layout.Header>
				<div class="content has-header" magic={!!images || null}>
					<div class="inner">
						<TextField class="text" multiline placeholder="Enter a message." value={text} onInput={this.linkState('text')} />

						<div class="magic">
							<div class="inner">
								{ images ? images.map( (p, i) => (
									<img
										data-magic={i}
										selected={(selectedMagic==i) || null}
										onClick={this.selectMagic}
										src={p.images.downsized.url} />
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
