import Emitter from 'wildemitter';
import jan from 'jan';
import Store from './store';

const enc = encodeURIComponent;

const EMPTY_FUNC = ()=>{};

const URL = '/api';		// 'https://v1.peachapi.com'

const CACHE_LIFETIME = 60 * 1000;

export default ({ url=URL, store, init=true }={}) => {
	let api = jan.ns(url),
		peach = new Emitter();

	if (!store) store = new Store('peach-client');

	peach.api = api;
	peach.url = url;
	peach.store = store;

	peach.init = callback => {
		if (typeof callback!=='function') callback = EMPTY_FUNC;
		let state = store.getState(),
			{ email, password } = state;
		if (email && password) {
			peach.login({ email, password }, err => {
				if (err) {
					// console.log('stored credentials failed: '+err);
					store.setState({ token:null });
					peach.emit('logout', {});
					callback('Invalid credentials', false);
				}
				else {
					//peach.emit('login', state);
					callback(null, true);
				}
			});
		}
		else {
			callback(null, false);
		}
	};

	peach.isLoggedIn = () => !!store.getState().token;


	api.on('req', ({ xhr, req }) => {
		// xhr.withCredentials = false;

		let h = req.headers || (req.headers = {}),
			{ id, token, streams } = store.getState();
		//let [, streamId] = req.url.match(/\/stream\/id\/([^\/]+)(\/|$)/i) || [];

		// if (!streamId && req.url.match(/\/stream\/visibility$/g)) {
		// 	streamId = streams && streams[0] && streams[0].id;
		// }
		// if (streams && streamId) {
		// 	let idToken = streams.filter(s=>s.id===streamId).map(s=>s.token)[0];
		// 	if (idToken) {
		// 		h.Authorization = `Bearer ${idToken}`;
		// 	}
		// }

		if (token && !h.Authorization) {
			h.Authorization = `Bearer ${token}`;
		}

		h.Accept = 'application/json';
		if (req.body && typeof req.body!=='string') {
			h['Content-Type'] = 'application/json';
			req.originalBody = req.body;
			req.body = JSON.stringify(req.body);
		}
	});

	api.on('res', ({ res, req }) => {
		let { data } = res;

		if (res.status===401) {
			res.error = 'Unauthorized';
			return;
		}

		if (data) {
			let error = data.error || (data.success===0 && 'Unspecified error');
			if (error) {
				res.error = error.Message || error.message || error;

				// overwrite incorrect http status codes
				if (res.status===200) {
					res.status = error.Code || error.code || 520;
				}
			}

			if (data.data) res.data = data = data.data;

			// parse out successful auth repsonses
			let streams = data.streams,
				rootStream = streams && streams[0] || {},
				id = rootStream.id || data.id,
				token = rootStream.token || data.token,
				state = store.getState();
			if (streams) {
				store.setState({ streams });
			}
			if (token && token!==state.token) {
				peach.emit('login', store.getState());
				let credentials = req.originalBody,
					root = { id:data.id, token:data.token };		// no clue what this is for yet
				store.setState({ id, token, ...credentials });
			}
		}

		// @TODO: check token here
		// let token = e.data;
		// if (token) {
		// 	let prev = store.getState().token;
		// 	if (token!==prev) store.setState({ token });
		// }
	});


	// strip res from callback
	let cb = callback => (err, res, data) => {
		// console.log(err, res, data);
		callback(err, data);
		callback = null;
	};


	// create a post method
	let method = (method, url) => (...args) => {
		let callback = args.pop(),
			body = args.pop();
		api({ method, url, body }, cb(callback));
	};


	/** { email, password } */
	peach.login = method('post', '/login');

	/** { name, email, password } */
	peach.register = method('post', '/register');

	peach.isEmailRegistered = method('post', '/precheck/create/user');

	peach.connections = method('get', '/connections');
	peach.connections.explore = method('get', '/connections/explore');

	peach.activity = method('get', '/activity');
	peach.activity.isUnread = method('get', '/activity/isUnread');

	// peach.stream.id = (id, cb) => peach.user.stream(id, cb);

	peach.user = {};

	/** Fetch the stream for a given user (by id) */
	peach.user.stream = (id, callback) => {
		let { streamCache } = store.getState();
		if (id==='me') id = store.getState().id;
		let cached = streamCache && streamCache[id];
		if (cached && streamCache.hasOwnProperty(id)) {
			if (cached && cached._fetched && (Date.now()-cached._fetched) < CACHE_LIFETIME) {
				return callback(null, cached);
			}
		}
		api.get(`/stream/id/${id}`, (err, res, data) => {
			if (data && data.error) {
				err = data.error.Message || 'Unknown error';
				data = null;
			}
			if (!err && data) {
				let { streamCache={} } = store.getState();
				data._fetched = Date.now();
				streamCache[id] = data;
				store.setState({ streamCache });
			}
			if (err && cached) {
				err = null;
				data = cached;
			}
			callback(err, data);
		});
	};

	peach.user.me = callback => {
		let { id, profile } = store.getState();
		if (profile) return callback(null, profile);
		peach.user.stream(id, (err, profile) => {
			if (profile) store.setState({ profile });
			callback(err, profile);
		});
	};

	/** Publish a text post */
	peach.post = (post, callback) => {
		if (typeof post==='string') post = { text:post, type:'text' };
		api.post({ url:'/post', body:{ message:[post] } }, cb(callback));
	};

	peach.wave = (targetStreamId, type, callback) => {
		api.post({ url:'/activity/wave', body:{ targetStreamId, type } }, cb(callback));
	};

	/** Like a post */
	peach.like = (postId, callback) => api.post('/like', { postId }, cb(callback));

	/** Un-like a post */
	peach.unlike = (postId, callback) => api.delete(`/like/postID/${id}`, cb(callback));

	/** Set your stream visibility */
	peach.setVisibility = method('post', '/stream/visibility');

	/** Get your stream visibility */
	peach.getVisibility = method('get', '/stream/visibility');

	/** Set your @username. Pass {name:"foo"} */
	peach.setName = method('put', '/stream/name');

	/** Set your display name. Pass {displayName:"foo"} */
	peach.setDisplayName = method('put', '/stream/displayName');

	// peach.setName = (name, callback) => api.post({ url:'/stream/name', body:{ name } }, cb(callback));
	// peach.setDisplayName = (displayName, callback) => api.post({ url:`/stream/id/${store.getState().id}/displayName`, body:{ displayName } }, cb(callback));

	/** Issue a friend request */
	peach.addFriend = (username, callback) => api.post(`/stream/n/${enc(username)}/connection`, cb(callback));

	/** Cancel a friend request */
	peach.removeFriend = (username, callback) => api.delete(`/stream/n/${enc(username)}/connection`, cb(callback));

	/** Issue a friend request */
	peach.acceptFriendRequest = (id, callback) => api.post(`/friend-request/${enc(id)}/accept`, cb(callback));

	if (init) setTimeout(peach.init, 1);
	return peach;
};
