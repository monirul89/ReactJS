import React, { Component } from 'react';

export default class FlatButton extends Component {
	constructor (props) {
		super(props);
		var self = this;

		this.state = {

		};

		[
			'_onClick'
		].map((i) => {
			self[i] = self[i].bind(self);
		})

	}

	_onClick (e) {
		var props = this.props;
		var val = e.target.checked;
		var onCheck = props.onCheck;
		if (onCheck) {
			onCheck(e, val);
		} else {
			this.setState({
				checked: val
			})
		}
	}

	render () {
		var self = this;
		// var stateObj = this.state;
		var props = this.props;

		var style = props.style || null;
		var label = props.label || '';
		var {label, backgroundColor} = props;

		var style = Object.assign({
			display: 'inline-block',
			padding: '6px 12px',
			borderRadius: '3px',
			boxShadow: '0 1px 6px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.12)'
		}, props.style || null);

		if (backgroundColor) style.backgroundColor = backgroundColor;

		var labelStyle = Object.assign({
			color: 'white',
			cursor: 'pointer',
			textTransform: 'uppercase'
		}, props.labelStyle || null);

		return (
			<div
				style={style}
				onClick={props.onClick || null}
				>
				<span style={labelStyle}>{label}</span>
			</div>

		);
	}
}