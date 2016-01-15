import store from './store';
import peachClient from 'peach-client';

let url = 'https://cors-anywhere.herokuapp.com/v1.peachapi.com:443';

let peach = peachClient({
	url,
	store,
	imgurKey: '92e78601cb60df3',
	init: false
});

window.peach = peach;
export default peach;

peach.on('login', () => {
	updateConnections();

	setInterval(updateConnections, 60000);
});

export function updateConnections() {
	peach.connections( (err, { connections, inboundFriendRequests, outboundFriendRequests }) => {
		store.setState({ connections, inboundFriendRequests, outboundFriendRequests });
	});
}
peach.updateConnections = updateConnections;
