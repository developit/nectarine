import { h, Component } from 'preact';
import { Layout, Button } from 'preact-mdl';
import { bind, memoize } from 'decko';
import { on, off, emit } from '../pubsub';

const TYPES = [
	['wave', '👋 Wave'],
	['cake', '🍰 Cake'],
	['hundred', '💯 100'],
	['boop', '👉👃 Boop'],
	['quarantine', '😷 Quarantine'],
	['kiss', '😘 Blow a kiss'],
	['ring', '💍 Put a ring on'],
	['hiss', '😾 Hiss']
];

export default class Wave extends Component {
	state = { open:false };

	componentDidMount() {
		on('wave', this.open);
	}

	componentWillUnmount() {
		off('wave', this.open);
	}

	@bind
	open({ to }) {
		emit('track', 'wave');
		if (!to) return console.warn('cant wave to nobody');
		this.setState({ open:true, to });
	}

	@bind
	close() {
		this.setState({ open:false, to:null });
	}

	@bind
	send({ type }) {
		let { to } = this.state;
		peach.wave(to, type, error => {
			if (error) alert(`Error: ${error}`);
			else this.close();
		});
	}

	@memoize
	sendType(type) {
		return () => this.send({ type });
	}

	render({ }, { open }) {
		return (
			<div class="wave modal" showing={open || null}>
				<div class="content has-footer">
					<div class="inner">
						<div class="scroll-list">
							{ TYPES.map( ([ type, text ]) => (
								<div class="scroll-list-item" onClick={this.sendType(type)}>
									{ text }
								</div>
							)) }
						</div>
					</div>
				</div>
				<div class="footer">
					<Button onClick={this.close}>Cancel</Button>
				</div>
			</div>
		);
	}
}
