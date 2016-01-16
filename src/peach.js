import store from './store';
import peachClient from 'peach-client';

let peach = peachClient({
	url: 'https://api.nectarine.rocks',		// Open-Source proxy, see: git.io/nectarine-api-proxy (it's 4 lines of code for extreme clarity)
	imgurKey: '92e78601cb60df3',
	store,
	init: false
});

window.peach = peach;
export default peach;

let updateConnectionsTimer;
peach.on('login', () => {
	updateConnections();

	clearInterval(updateConnectionsTimer);
	updateConnectionsTimer = setInterval(updateConnections, 60000);
});

export function updateConnections() {
	peach.connections( (err, { connections, inboundFriendRequests, outboundFriendRequests }) => {
		store.setState({ connections, inboundFriendRequests, outboundFriendRequests });
	});
}
peach.updateConnections = updateConnections;
