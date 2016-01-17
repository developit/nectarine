import { h, Component } from 'preact';
import { bind } from 'decko';
import { Layout, TextField, Button, Icon } from 'preact-mdl';
import peach from '../peach';
import { emit } from '../pubsub';

const NOOP = ()=>{};

export default class Login extends Component {
	state = {
		type: 'register'
	};

	componentWillMount() {
		if (Object.keys(peach.store.getState()).length) {
			this.setState({ type:'login' });
		}
		emit('track', this.state.type);
	}

	@bind
	submit(e) {
		let { type, name, email, password } = this.state,
			creds = { name, email, password };
		if (type==='login') delete creds.name;
		for (let i in creds) if (!creds[i] || creds[i].length<3) {
			return this.setState({ error:`Invalid ${i}` });
		}
		peach[type](creds, (error, session) => {
			if (error) return this.setState({ error });

			if (type==='register') {
				// auto-follow @nectarineapp so that we can see "friends of friends" in the explore tab
				// the reason this uses @nectarineapp is because it has peachme set up to automatically accept our follow request.
				// worst-case the request fails. then we time out after 10s and redirect to explore, but Peach is not fun without friends :(
				peach.addFriend('nectarineapp', () => {
					let timedOut = false;
					let timer = setTimeout( () => {
						timedOut = true;
						emit('go', '/explore');
					}, 10000);
					peach.rawRequest({
						method: 'POST',
						url: 'https://peachme.nectarine.rocks/follow',
						body: JSON.stringify({ name }),
						headers: {'Content-Type':'application/json' }
					}, () => {
						clearTimeout(timeout);
						if (timedOut) emit('refresh');
						else emit('go', '/explore');
					});
				});
			}
		});
		if (e) return e.preventDefault(), false;
	}

	@bind
	switchMode() {
		let type = this.state.type==='register' ? 'login' : 'register';
		emit('track', type);
		this.setState({ type });
	}

	@bind
	checkEmail() {
		let { type, email } = this.state;
		peach.isEmailRegistered({ email }, (error, isRegistered) => {
			console.log(error, isRegistered);
		});
	}

	componentWillReceiveProps({ type }) {
		if (type) this.setState({ type });
	}

	render({}, { type, name, email, password, error }) {
		return (
			<Layout id="login" fixed-header={true} js={false}>
				<Layout.Header>
					<Layout.HeaderRow>
						<Layout.Title centered>
							{ type==='register' ? 'Sign Up' : 'Log In' }
						</Layout.Title>

						<Layout.Spacer />

						<Icon icon="arrow forward" onClick={this.submit} />
					</Layout.HeaderRow>
				</Layout.Header>

				<form action="javascript:" onSubmit={this.submit}>
					<div class={{error:1, showing:error}}>{ error || null }</div>

					<div style={{ maxHeight: type==='register'?100:0, transition:'all 500ms ease', overflow:'hidden' }}>
						<TextField
							label="Username"
							floating-label
							pattern="^[a-z0-9_.-]+$"
							required={type==='register' && !!error || null}
							onInput={ this.linkState('name') }
							onChange={ this.checkEmail }
							value={ name } />
					</div>

					<TextField
						label="Email"
						type="email"
						required={!!error || null}
						floating-label
						onInput={ this.linkState('email') }
						value={ email } />

					<TextField
						type="password"
						label="Password"
						required={!!error || null}
						floating-label
						onInput={ this.linkState('password') }
						value={ password } />

					<button-bar>
						<Button raised colored onClick={this.submit}>
							{ type==='register' ? 'Sign Up' : 'Log In' }
						</Button>
					</button-bar>

					<button-bar>
						<a onClick={this.switchMode}>{ type==='register' ? 'Already have an account?' : 'Need to sign up?' }</a>
					</button-bar>
				</form>
			</Layout>
		);


		/*
		return (
			<div id="login">
				<div class="list">
					<label class="item item-input item-stacked-label" visible={type==='register'}>
						<span class="input-label">Name</span>
						<input type="text" placeholder="John Doe"
							value={name} onChange={this.linkState('name')} />
					</label>

					<label class="item item-input item-stacked-label">
						<span class="input-label">Email</span>
						<input type="email" placeholder="you@example.com"
							value={email} onChange={this.linkState('email')} />
					</label>

					<label class="item item-input item-stacked-label">
						<span class="input-label">Password</span>
						<input type="password"
							value={password} onChange={this.linkState('password')} />
					</label>
				</div>

				<div class="padding">
					<button class="button button-block button-positive" onClick={this.submit}>
						{ type==='register' ? 'Sign Up' : 'Log In' }
					</button>
				</div>

				<div class="padding">
					<a onClick={this.switchMode}>{ type==='register' ? 'Already have an account?' : 'Need to sign up?' }</a>
				</div>
			</div>
		);
		*/
	}
}
