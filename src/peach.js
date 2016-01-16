import store from './store';
import peachClient from 'peach-client';

const URLS = [
	// Open-Source proxy, see: git.io/nectarine-api-proxy (it's 4 lines of code for extreme clarity)
	'https://api.nectarine.rocks',
	// Previous Open-Source proxy, see: git.io/cors-anywhere (being phased out)
	'https://cors-anywhere.herokuapp.com/v1.peachapi.com:443'
];

let url = URLS[Math.random()*URLS.length|0];

let peach = peachClient({
	url,
	store,
	imgurKey: '92e78601cb60df3',
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
