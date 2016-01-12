import store from './store';
import peachClient from 'peach-client';

let peach = peachClient({ store, init:false });;
window.peach = peach;
export default peach;

peach.on('login', () => {
	updateConnections();
});

export function updateConnections() {
	peach.connections( (err, { connections, inboundFriendRequests, outboundFriendRequests }) => {
		store.setState({ connections, inboundFriendRequests, outboundFriendRequests });
	});
}
peach.updateConnections = updateConnections;
