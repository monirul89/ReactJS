import React, { Component } from 'react';

class Icon extends Component {
	constructor (props) {
		super(props);
	}

	render () {
		var props = this.props;

		var style = {
			display: 'inline-block',
			color: '#000',
			fill: '#000',
			height: '24px',
			width: '24px',
			userSelect: 'none',
			transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
			verticalAlign: 'middle',
			cursor: 'pointer'
		}

		return (
			<svg 
				onClick={props.onClick || null}
				viewBox="0 0 24 24" 
				style={Object.assign(style, props.style || null)}>
				<path d={props.d}></path>
			</svg>
		);
	}
}

class IconAdd extends Component {
	constructor (props) {
		super(props);
	}

	render () {
		var props = this.props;

		var style = {
			color: 'rgb(255, 255, 255)',
			fill: 'rgb(255, 255, 255)'
		}

		props.style ? Object.assign(style, props.style) : null;

		return (
			<Icon
				onClick={props.onClick}
				style={{
					color: 'rgb(255, 255, 255)',
					fill: 'rgb(255, 255, 255)'
				}}
				d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
				style={style}
				/>
		);

	}
}

class IconRemove extends Component {
	constructor (props) {
		super(props);
	}

	render () {
		var props = this.props;

		var style = {
			color: 'red',
			fill: 'red',
			height: '14px',
			width: '14px'
		}

		props.style ? Object.assign(style, props.style) : null;

		return (
			<Icon
				onClick={props.onClick}
				d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"
				style={style}
				/>
		);
	}
}

class IconEdit extends Component {
	constructor (props) {
		super(props);
	}

	render () {
		var props = this.props;

		var style = {
			fill: '#fff',
			height: '16px',
			width: '16px'
		}

		props.style ? Object.assign(style, props.style) : null;

		return (
			<Icon
				onClick={props.onClick}
				d="M18 14.45v6.55h-16v-12h6.743l1.978-2h-10.721v16h20v-10.573l-2 2.023zm1.473-10.615l1.707 1.707-9.281 9.378-2.23.472.512-2.169 9.292-9.388zm-.008-2.835l-11.104 11.216-1.361 5.784 5.898-1.248 11.103-11.218-4.536-4.534z"
				style={style}
				/>
		);
	}
}

class IconFolder extends Component {
	constructor (props) {
		super(props);
	}

	render () {
		var props = this.props;

		var style = {
			fill: '#fff',
			height: '16px',
			width: '16px'
		}

		props.style ? Object.assign(style, props.style) : null;

		return (
			<Icon
				onClick={props.onClick}
				d="M21.604 13l-1.272 7h-16.663l-1.272-7h19.207zm-14.604-11h-6v7h2v-5h3.084c1.38 1.612 2.577 3 4.916 3h10v2h2v-4h-12c-1.629 0-2.305-1.058-4-3zm17 9h-24l2 11h20l2-11z"
				style={style}
				/>
		);
	}
}

class IconSave extends Component {
	constructor (props) {
		super(props);
	}

	render () {
		var props = this.props;

		var style = {
			fill: '#fff',
			height: '12px',
			width: '12px'
		}

		props.style ? Object.assign(style, props.style) : null;

		return (
			<Icon
				onClick={props.onClick}
				d="M15.003 3h2.997v5h-2.997v-5zm8.997 1v20h-24v-24h20l4 4zm-19 5h14v-7h-14v7zm16 4h-18v9h18v-9z"
				style={style}
				/>
		);
	}
}

class IconRight extends Component {
	constructor (props) {
		super(props);
	}

	render () {
		var props = this.props;

		var style = {
			fill: '#fff',
			height: '12px',
			width: '12px'
		}

		props.style ? Object.assign(style, props.style) : null;

		return (
			<Icon
				onClick={props.onClick}
				d="M7.33 24l-2.83-2.829 9.339-9.175-9.339-9.167 2.83-2.829 12.17 11.996z"
				style={style}
				/>
		);
	}
}

class IconLeft extends Component {
	constructor (props) {
		super(props);
	}

	render () {
		var props = this.props;

		var style = {
			fill: '#fff',
			height: '12px',
			width: '12px'
		}

		props.style ? Object.assign(style, props.style) : null;

		return (
			<Icon
				onClick={props.onClick}
				d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z"
				style={style}
				/>
		);
	}
}

class IconFullScreen extends Component {
	constructor (props) {
		super(props);
	}

	render () {
		var props = this.props;

		var style = {
			fill: '#fff',
			height: '12px',
			width: '12px'
		}

		props.style ? Object.assign(style, props.style) : null;

		return (
			<Icon
				onClick={props.onClick}
				d="M24 9h-2v-7h-7v-2h9v9zm-9 15v-2h7v-7h2v9h-9zm-15-9h2v7h7v2h-9v-9zm9-15v2h-7v7h-2v-9h9z"
				style={style}
				/>
		);
	}
}

class IconPopOut extends Component {
	constructor (props) {
		super(props);
	}

	render () {
		var props = this.props;

		var style = {
			fill: '#fff',
			height: '12px',
			width: '12px'
		}

		props.style ? Object.assign(style, props.style) : null;

		return (
			<Icon
				onClick={props.onClick}
				d="M16 2v7h-2v-5h-12v16h12v-5h2v7h-16v-20h16zm2 9v-4l6 5-6 5v-4h-10v-2h10z"
				style={style}
				/>
		);
	}
}

class IconBottom extends Component {
	constructor (props) {
		super(props);
	}

	render () {
		var props = this.props;

		var style = {
			fill: '#000',
			height: '12px',
			width: '12px'
		}

		props.style ? Object.assign(style, props.style) : null;

		return (
			<Icon
				onClick={props.onClick}
				d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z"
				style={style}
				/>
		);
	}
}

class IconTop extends Component {
	constructor (props) {
		super(props);
	}

	render () {
		var props = this.props;

		var style = {
			fill: '#000',
			height: '12px',
			width: '12px'
		}

		props.style ? Object.assign(style, props.style) : null;

		return (
			<Icon
				onClick={props.onClick}
				d="M0 16.67l2.829 2.83 9.175-9.339 9.167 9.339 2.829-2.83-11.996-12.17z"
				style={style}
				/>
		);
	}
}


export {
	IconAdd,
	IconFolder,
	IconEdit,
	IconRemove,
	IconSave,
	IconRight,
	IconLeft,
	IconFullScreen,
	IconPopOut,
	IconBottom,
	IconTop
}