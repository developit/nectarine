import { h, Component } from 'preact';
import { Layout, TextField, Button, Icon, CheckBox } from 'preact-mdl';
import { bind } from 'decko';
import { on, off, emit } from '../pubsub';

const CLEAN = {
	type: 'text',
	text: '',
	error: null
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
		let { text, type } = this.state;
		if (!text && type==='text') return this.setState({ error:'Enter a message' });

		peach.post({ text, type }, (error, result) => {
			if (error) this.setState({ error });
			else this.close();
		});
	}

	render({ }, { open, text='', error }) {
		return (
			<div class="create modal" showing={open || null}>
				<Layout.Header manual>
					<Layout.HeaderRow>
						<Button icon onClick={this.close}><Icon icon="close" /></Button>
						<Layout.Title>New Post</Layout.Title>
						<Layout.Spacer />
						<Button icon onClick={this.submit}><Icon icon="send" /></Button>
					</Layout.HeaderRow>
				</Layout.Header>
				<div class="content">
					<div class="inner">
						<TextField class="text" multiline placeholder="Enter a message." value={text} onInput={this.linkState('text')} />
						{/*
						<button-bar>
							<Button raised accent onClick={this.submit}>Post</Button>
						</button-bar>
						*/}
					</div>
					{ error ? <div class={{error:1, showing:error}}>{ error }</div> : null }
				</div>
			</div>
		);
	}
}
