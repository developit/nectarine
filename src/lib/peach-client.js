import Emitter from 'wildemitter';
import jan from 'jan';
import Store from './store';

const enc = encodeURIComponent;

const EMPTY_FUNC = ()=>{};

const URL = '/api';		// 'https://v1.peachapi.com'

const CACHE_LIFETIME = 60 * 1000;

export default ({ url=URL, store, imgurKey, init=true }={}) => {
	let api = jan.ns(url),
		peach = new Emitter();

	if (!store) store = new Store('peach-client');
	// if (!store.getState().streamCache) {
	// 	store.setState({ streamCache:{} });
	// }

	peach.rawRequest = jan;
	peach.api = api;
	peach.url = url;
	peach.store = store;
	peach.streamCache = {};
	peach._openRequests = 0;

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


	peach.isLoading = () => peach._openRequests>0;


	api.on('req', ({ xhr, req }) => {
		if (!peach._openRequests++) peach.emit('loadstart');

		let h = req.headers || (req.headers = {}),
			{ id, token, streams } = store.getState();

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

		if (!--peach._openRequests) peach.emit('loadend');

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

				// since we just logged in, fetch the user's profile:
				peach.user.me(EMPTY_FUNC, false);
			}
		}
	});


	// strip res from callback
	let cb = callback => (err, res, data) => {
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

	/** Mark a stream as read. */
	peach.markAsRead = (id, callback=EMPTY_FUNC) => {
		updateCachedConnection('id', id, {
			unreadPostCount: 0,
			lastRead: (Date.now() / 1000)|0
		});
		api.put(`/stream/id/${enc(id)}/read`, cb(callback));
	};


	function updateCachedConnection(by, value, update) {
		let { connections } = peach.store.getState();
		if (connections) {
			for (let i=connections.length; i--; ) {
				if (connections[i][by]===value) {
					if (update===false) {
						connections.splice(i, 1);
					}
					else {
						for (let p in update) {
							if (update.hasOwnProperty(p)) {
								connections[i][p] = update[p];
							}
						}
					}
					peach.store.setState({ connections });
					return true;
				}
			}
		}
		return false;
	}


	// peach.stream.id = (id, cb) => peach.user.stream(id, cb);

	peach.user = {};

	/** Fetch the stream for a given user (by id) */
	peach.user.stream = (id, callback=EMPTY_FUNC, opts={}) => {
		if (id && typeof id==='object') {
			opts = id;
			id = id.id;
		}
		if (id==='me') id = store.getState().id;
		let cached = peach.streamCache[id];
		if (!opts.optimistic && cached && peach.streamCache.hasOwnProperty(id)) {
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
				// data._fetched = Date.now();
				peach.cacheStream(data);
			}
			if (err && cached && opts.fallback!==false) {
				err = null;
				data = cached;
			}
			callback(err, data);
		});
	};

	peach.user.me = (callback=EMPTY_FUNC, cache=true) => {
		let { id, profile } = store.getState();
		if (profile && cache!==false) return callback(null, profile);
		peach.user.stream(id, (err, profile) => {
			if (profile) store.setState({ profile });
			callback(err, profile);
		});
	};


	let hasComments = stream => (stream && stream.posts && stream.posts.filter( p => p.hasOwnProperty('comments') ).length>0);


	peach.cacheStream = stream => {
		let cached = peach.streamCache[stream.id];
		if (hasComments(cached) && !hasComments(stream)) {
			//console.warn(`ignoring cache update for ${stream.id}, no comments`);
			return;
		}
		if (!stream._fetched) stream._fetched = Date.now();
		peach.streamCache[stream.id] = stream;
	};


	/** Publish a text post */
	peach.post = (post, callback) => {
		if (typeof post==='string') post = { text:post, type:'text' };
		api.post({ url:'/post', body:{ message:[].concat(post) } }, cb(callback));
	};

	/** Delete a post. */
	peach.deletePost = (id, callback) => api.delete(`/post/${enc(id)}`, cb(callback));

	/** Send a wave of some type to the given profile ID.
	 *	Available `type` values:
	 *	- `wave`
	 *	- `ring`
	 *	- `hundred` (100'd)
	 *	- `cake`
	 *	- `boop`
	 *	- `quarantine`
	 *	- `kiss`
	 *	- `hiss`
	 *	@param {String} targetStreamId	The ID of the stream to send the wave to
	 *	@param {String} type			A valid wave type
	 *	@param {Function} [callback]
	 */
	peach.wave = (targetStreamId, type, callback) => {
		api.post({ url:'/activity/wave', body:{ targetStreamId, type } }, cb(callback));
	};

	/** Like a post */
	peach.like = (postId, callback) => api.post({ url:'/like', body:{ postId } }, cb(callback));

	/** Un-like a post */
	peach.unlike = (postId, callback) => api.delete(`/like/postID/${postId}`, cb(callback));

	/** Add a comment to a post.
	 *	@param {Object} comment
	 *	@param {String} comment.postId	ID of the post to comment on
	 *	@param {String} body			The comment message text
	 */
	peach.comment = method('post', '/comment');

	/** Delete a comment, either your own or off of a post of yours.
	 *	@param {string} id		The comment ID
	 */
	peach.deleteComment = (id, callback) => api.delete(`/comment/${enc(id)}`, cb(callback));

	/** Set your stream visibility */
	peach.setVisibility = method('post', '/stream/visibility');

	/** Get your stream visibility */
	peach.getVisibility = method('get', '/stream/visibility');

	/** Set your @username. Pass {name:"foo"} */
	peach.setName = method('put', '/stream/name');

	/** Set your bio. Pass {bio:"foo"} */
	peach.setBio = method('put', '/stream/bio');

	/** Set your display name. Pass {displayName:"foo"} */
	peach.setDisplayName = method('put', '/stream/displayName');

	/** Set your avatar URL. Pass {avatarSrc:"https://..."} */
	//peach.setAvatar = method('put', '/stream/avatarSrc');
	peach.setAvatar = (avatarSrc, callback=EMPTY_FUNC) => {
		api.put({ url:'/stream/avatarSrc', body:{ avatarSrc } }, (err, res, data={}) => {
			callback(err, err ? null : { avatarSrc, ...data });
		});
	};

	peach.uploadAvatar = (image, callback=EMPTY_FUNC) => {
		peach.uploadImage(image, (err, { url }) => {
			if (err) return callback(err);
			peach.setAvatar(url, callback);
		});
	};

	peach.uploadImage = (image, callback=EMPTY_FUNC) => {
		let body = new FormData();
		body.append('type', 'file');
		body.append('image', image);
		jan.post({
			url: 'https://api.imgur.com/3/image',
			headers: { Authorization: `Client-ID ${imgurKey}` },
			body
		}, (err, res, data) => {
			data = data && data.data || data;
			if (!err && !data) err = 'Invalid response';
			if (err) return callback(err);
			let url = data.link || `https://i.imgur.com/${data.id}.png`;
			if (typeof url==='string') url = url.replace(/^http:\/\//g, 'https://');
			callback(null, { url, ...data });
		});
	};

	// peach.setName = (name, callback) => api.post({ url:'/stream/name', body:{ name } }, cb(callback));
	// peach.setDisplayName = (displayName, callback) => api.post({ url:`/stream/id/${store.getState().id}/displayName`, body:{ displayName } }, cb(callback));

	/** Issue a friend request */
	peach.addFriend = (username, callback) => api.post(`/stream/n/${enc(username)}/connection`, cb(callback));

	/** Cancel a friend request */
	peach.removeFriend = (id, callback) => {
		updateCachedConnection('id', id, false);
		let cached = peach.streamCache[id];
		if (cached) cached.youFollow = false;
		api.delete(`/stream/id/${enc(id)}/connection`, cb(callback));
	};

	/** Issue a friend request */
	peach.acceptFriendRequest = (id, callback) => api.post(`/friend-request/${enc(id)}/accept`, cb(callback));

	/** Deny a friend request */
	peach.denyFriendRequest = (id, callback) => api.delete(`/friend-request/${enc(id)}`, cb(callback));

	if (init) setTimeout(peach.init, 1);
	return peach;
};
