
//setInterval(update, 5000);

let updateTimer = setTimeout(updateAllVisibility, 100);
let elements;
let lastUpdated;
let cache = {};

export function updateAllVisibility() {
	clearTimeout(updateTimer);

	let now = Date.now();
	if (!lastUpdated || (now-lastUpdated)>1000) {
		elements = document.querySelectorAll('[optimized-visibility]');
	}

	// let el = document.querySelectorAll('[optimized-visibility]');
	cache.wh = window.innerHeight;
	cache.ww = window.innerWidth;

	for (let i=elements.length; i--; ) {
		updateVisibility(elements[i]);
	}

	// console.log( [].filter.call(elements, p => p._visible).length + ' of '+elements.length);
	updateTimer = setTimeout(updateAllVisibility, 5000);
}

function updateVisibility(el) {
	let visible = inViewport(el),
		wasVisible = el._visible!==false;	// && el.hasAttribute('visible');
	if (visible!==wasVisible) {
		el._visible = visible;
		el.style.visibility = visible ? '' : 'hidden';
		if (el.hasAttribute('more-optimized')) {
			if (visible) el.setAttribute('visible', true);
			else el.removeAttribute('visible');
		}
	}
}

function inViewport(el) {
	let { top, left, right, bottom, width, height } = el.getBoundingClientRect();
	return (
		top >= -height &&
		left >= -width &&
		bottom <= (cache.wh + height) &&
		right <= (cache.ww + width)
	);
}
