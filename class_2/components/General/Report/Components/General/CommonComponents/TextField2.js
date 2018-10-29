import React, { Component } from 'react';

export default class TextField2 extends Component {
	constructor (props) {
		super(props);
		var self = this;

		this.state = {

		};

		[

		].map((i) => {
			self[i] = self[i].bind(self);
		})

	}

	render () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;

		var value = stateObj.value;

		var style = Object.assign({
			marginTop: '15px',
			// paddingTop: '20px',
			position: 'relative'
		}, props.style || null);
		var floatingLabelText = props.floatingLabelText || null;

		/*var floatingLabelStyle = {
			position: 'absolute',
			transition: 'all .15s linear'
		}

		var flsExt = { // floatingLabelStyleExtended
			color: 'rgba(0, 0, 0, 0.3)',
			top: '3px',
			fontSize: '12px',
			fontWeight: 'bold'
		}; 

		Object.assign(floatingLabelStyle, flsExt);*/

		return (
			<div
				style={style}
				>
				{/*<div
					style={floatingLabelStyle}
					>
					{floatingLabelText}
				</div>*/}
				<label>{floatingLabelText}</label>
				<input 
					onChange={props.onChange}
					className="form-control"
					value={props.value}
					id={props.id || null}
					name={props.name || null}
					/>
			</div>

		);
	}
}