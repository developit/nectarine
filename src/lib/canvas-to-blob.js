export default function(canvas, callback, type='image/png', quality) {
	if (typeof canvas.toBlob==='function') {
		return canvas.toBlob(callbac, type, quality);
	}

	let binStr = atob(canvas.toDataURL(type, quality).split(',')[1] ),
		len = binStr.length,
		arr = new Uint8Array(len);
	for (let i=len; i--; ) arr[i] = binStr.charCodeAt(i);
	callback(new Blob([arr], { type }));
}
