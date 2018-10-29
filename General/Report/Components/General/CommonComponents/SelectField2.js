import React, { Component } from 'react';
import Select from 'react-select';

export default class SelectField2 extends Component {
	constructor (props) {
		super(props);
		var self = this;

		this.state = {

		};

		[
			// '_onItemClick',
			// '_onFocus',
			// '_onBlur'
		].map((i) => {
			self[i] = self[i].bind(self);
		})

	}

	render () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;

		var value = stateObj.value;

		// var labels = [];
		var style = Object.assign({
			marginTop: '15px',
			// paddingTop: '20px',
			position: 'relative',
			outline: 'none',
			// zIndex: '1'
		}, props.style || null);

		// if (isFocused) {
			style.overflow = 'visible';
		// }

		var selectedMenuItemStyle = props.selectedMenuItemStyle || {};

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

		var options = props.options;
		// options = [{label: 'Test', value: 'asd'}, {label: 'ss', value: '123'}, {label: 'sscxas', value: '12213123'}].concat(options);
		// options = [{label: 'Test', value: 'asd'}, {label: 'ss', value: ''}];

		return (
			<div
				style={style}
				tabIndex={-1}
				>
				{/*<div
					style={floatingLabelStyle}
					>
					{floatingLabelText}
				</div>*/}
				<label>{floatingLabelText}</label>
				<Select
					placeholder={floatingLabelText}
		          	value={props.value}
		          	onChange={props.onChange}
		          	style={props.selectDefaultStyle}
		          	multi={props.multiple ? true : false}
	          		// selectedMenuItemStyle={selectedMenuItemStyle}
	          		options={options}
					/>
			</div>

		);
	}
}