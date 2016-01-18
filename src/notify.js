import store from './store';
import { on, off, emit } from './pubsub';

const EMPTY_ARR = [];

const EMPTY = {};

let prevState;


function handleStoreUpdate({ activityItems, inboundFriendRequests, prefs:{ showNotifications }={} }) {
	// activityItems = activityItems.slice();
	// inboundFriendRequests = inboundFriendRequests.slice();

	if (prevState) {
		if (!prevState.showNotifications && showNotifications===true) {
			requestPermission();
		}

		let fr = findNew(inboundFriendRequests, prevState.inboundFriendRequests);
		if (fr) {
			notify(
				`${fr.length} new friend request${fr.length===1?'':'s'}`,
				fr.slice(0, 3).map(toDisplayName).join(', ') + (fr.length>3 ? ` + ${fr.length-3} more` : ''),
				'/notifications'
			);
		}

		let updates = findNew(activityItems, prevState.activityItems);
		if (updates) {
			let types = updates.map( p => p.type ).filter( (t, i, a) => a.indexOf(t)===i );
			notify(
				`${updates.length} ${types.length===1?types[0]:'update'}${updates.length===1?'':'s'}`,
				'From ' + updates.slice(0, 3).map(toDisplayName).join(', ') + (updates.length>3 ? ` + ${updates.length-3} more` : ''),
				'/stream'
			);
		}
	}

	prevState = { activityItems, inboundFriendRequests, showNotifications };
}


export function init() {
	let { prefs } = store.getState();
	if (prefs && prefs.showNotifications===false) return;

	requestPermission();

	store.subscribe(handleStoreUpdate);
}

function requestPermission() {
	if (Notification.permission!=='granted') {
		Notification.requestPermission( permission => {
			if (permission!=='granted') {
				let { prefs={} } = store.getState();
				prefs.showNotifications = false;
				store.setState({ prefs });
			}
		});
	}
}

function allowed() {
	let { prefs } = store.getState();
	return (!prefs || prefs.showNotifications!==false) && Notification.permission==='granted';
}

function findNew(newArr, oldArr) {
	let oldIds = (oldArr || EMPTY_ARR).map(toId),
		out;
	newArr = newArr || [];
	for (let i=0; i<newArr.length; i++) {
		let p = newArr[i];
		if (oldIds.indexOf(toId(p))===-1) {
			if (!out) out = [p];
			else out.push(p);
		}
	}
	return out || false;
}

let toId = ({ id, createdTime, body }) => (id || `${body.postID}-${createdTime}`);

let toDisplayName = ({ stream, body }) => (stream || body && body.authorStream || EMPTY).displayName;

export function notify(title, body, url) {
	if (!allowed()) return;

	let n = new Notification(title, {
		icon: '/assets/icon-300.png',
		tag: 'peach',
		body
	});
	n.onclick = () => {
		n.close();
		window.focus();
		if (url) emit('go', url);
	};
}
