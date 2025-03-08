export function opaqueFetch(url, opts) {
	return new Promise((resolve) => {
		const w = new Worker(
			`data:text/javascript,${encodeURIComponent(
				`onmessage=${(e) => {
					fetch(e.data.url, e.data).then((r) => {
						r.arrayBuffer().then((body) => {
							postMessage({
								status: r.status,
								headers: Object.fromEntries(r.headers.entries()),
								body,
							});
						});
					});
				}}`,
			)}`,
		);
		w.onmessage = (e) => {
			w.terminate();
			resolve(new Response(e.data.body, e.data));
		};
		const r = new Request(url, opts);
		r.arrayBuffer().then((body) => {
			w.postMessage({
				url: r.url,
				method: r.method,
				headers: Object.fromEntries(r.headers.entries()),
				body,
			});
		});
	});
}
