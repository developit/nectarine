import Emitter from 'wildemitter';

export default class Store extends Emitter {
	data = {};

	subscribe(fn) {
		this.on('change', fn);
	}

	unsubscribe(fn) {
		this.off('change', fn);
	}

	getState() {
		return this.data;
	}

	setState(state) {
		for (let i in state) if (state.hasOwnProperty(i)) {
			this.data[i] = state[i];
		}
		this.emit('change', this.data);
	}
}
