import emitter from 'mitt';

export default () => {
	let self = emitter();

	self.data = {};

	self.subscribe = fn => {
		self.on('change', fn);
	};

	self.unsubscribe = fn => {
		self.off('change', fn);
	};

	self.getState = () => self.data;

	self.setState = state => {
		for (let i in state) if (state.hasOwnProperty(i)) {
			self.data[i] = state[i];
		}
		self.emit('change', self.data);
	};

	return self;
};
