import Emitter from 'wildemitter';

const pubsub = new Emitter();
export default pubsub;

let emit = ::pubsub.emit;
let on = ::pubsub.on;
let off = ::pubsub.off;
export { emit, on, off };
