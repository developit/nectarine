
setInterval(() => {
	let el = document.querySelectorAll('[optimized-visibility]');
	for (let i=el.length; i--; ) {
		updateVisibility(el[i]);
	}
}, 1000);

function updateVisibility(el) {
	let visible = inViewport(el),
		wasVisible = el._visible || false;	// && el.hasAttribute('visible');
	if (visible!==wasVisible) {
		el._visible = visible;
		el.style.visibility = visible ? 'visible' : 'hidden';
		if (el.hasAttribute('more-optimized')) {
			if (visible) el.setAttribute('visible', true);
			else el.removeAttribute('visible');
		}
		// if (visible) {
		// 	el.setAttribute('visible', true);
		// }
		// else {
		// 	el.removeAttribute('visible');
		// }
	}
}

function inViewport(el) {
	let { top, left, right, bottom, width, height } = el.getBoundingClientRect();
	return top>=-height && left>=-width && bottom<=window.innerHeight+height && right<=window.innerWidth+width;
}
