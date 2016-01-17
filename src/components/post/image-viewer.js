import { h, Component } from 'preact';
import { bind } from 'decko';

// const IMG = [];
//
// setInterval(() => IMG.forEach(updateVisibility), 1000);
//
// function updateVisibility(img) {
// 	let visible = inViewport(img),
// 		wasVisible = img._visible || false;
// 	if (visible!==wasVisible) {
// 		img._visible = visible;
// 		if (visible) {
// 			img.setAttribute('visible', true);
// 		}
// 		else {
// 			img.removeAttribute('visible');
// 		}
// 	}
// }
//
// function inViewport(el) {
// 	let { top, left, right, bottom, width, height } = el.getBoundingClientRect();
// 	return top>=-height && left>=-width && bottom<=window.innerHeight+height && right<=window.innerWidth+width;
// }

export default class ImageViewer extends Component {
	shouldComponentUpdate({ src }) {
		return src!==this.props.src;
	}

	// componentDidMount() {
	// 	let i = IMG.indexOf(this.base);
	// 	if (i===-1) IMG.push(this.base);
	// }
	//
	// componentWillUnmount() {
	// 	let i = IMG.indexOf(this.base);
	// 	if (i!==-1) IMG.splice(i, 1);
	// }
	//
	// componentDidUpdate() {
	// 	if (this.base) updateVisibility(this.base);
	// }

	// @bind
	// toggle(e) {
	// 	this.setState({ full: !this.state.full });
	// 	if (e) return e.preventDefault(), e.stopPropagation(), false;
	// }

	render({ src }, { full }) {
		return <img src={src} style={{
			display: 'block',
			maxWidth: full?'auto':'',
			margin: 'auto'
		}} optimized-visibility onClick={this.toggle} />;
	}
}
