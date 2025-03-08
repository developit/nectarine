import store from "./store";
import peachClient from "peach-client";
import { parallel } from "praline";

let peach = peachClient({
	url: "https://api.nectarine.rocks", // Open-Source proxy, see: https://github.com/developit/nectarine-api-proxy (it's 4 lines of code for extreme clarity)
	imgurKey: "546c25a59c58ad7",
	store,
	init: false,
});

window.peach = peach;
export default peach;

let updateConnectionsTimer;
peach.on("login", () => {
	setTimeout(updateConnections, 1);

	clearInterval(updateConnectionsTimer);
	updateConnectionsTimer = setInterval(updateConnections, 60000);
});

let lastUpdate;
export function updateConnections() {
	let now = Date.now();
	if (lastUpdate && now - lastUpdate < 5000) return;
	lastUpdate = now;

	parallel(
		[peach.activity, peach.connections],
		(
			err,
			{ activityItems = [] } = {},
			{ connections, inboundFriendRequests, outboundFriendRequests } = {},
		) => {
			store.setState({
				activityItems,
				connections,
				inboundFriendRequests,
				outboundFriendRequests,
			});
		},
	);
}
peach.updateConnections = updateConnections;
