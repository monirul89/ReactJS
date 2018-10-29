import React, { Component } from 'react';

class Item extends Component {
	constructor (props) {
		super(props);
		var self = this;

		this.state = {
			hovered: false
		};

		// ** Should we implement a `selected` state here??

		[
			'_onClick',
			'_onMouseEnter',
			'_onMouseLeave'
		].map((i) => {
			self[i] = self[i].bind(self);
		})
	}

	_onClick (e) {
		var props = this.props;
		props.onClick(e, props.index, props.data);
	}

	_onMouseEnter (e) {
		this.setState({
			hovered: true
		})
	}

	_onMouseLeave (e) {
		this.setState({
			hovered: false
		})
	}

	render () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;
		var data = props.data;

		var style = Object.assign({
			backgroundColor: 'white',
			width: '100%',
			padding: '5px',
			cursor: 'pointer',
			borderBottom: '1px solid #eee',
			transition: 'all .2s ease-in-out'
		}, data.style || null, props.extendedStyle);

		if (stateObj.hovered) {
			style.backgroundColor = '#3f5061';
			if (!props.selected) {
				style.color = 'white';
			}

		}

		return (
			<div
				style={style}
				onClick={this._onClick}
				onMouseEnter={this._onMouseEnter}
				onMouseLeave={this._onMouseLeave}
				>
				{data.label || <div style={{visibility: 'hidden'}}>Empty</div>}
			</div>
		);
	}
}

export default class SelectField extends Component {
	constructor (props) {
		super(props);
		var self = this;

		this.state = {
			value: props.value,
			isFocused: false
		};

		[
			'_onItemClick',
			'_onFocus',
			'_onBlur'
		].map((i) => {
			self[i] = self[i].bind(self);
		})

	}

	componentWillReceiveProps (nextProps) {
		this.setState({
			value: nextProps.value
		})
	}

	_onItemClick (e, index, item) {
		var props = this.props;
		var value = item.value;
		var stateValue = '';
		var selectedValues = {};

		var prevValues = this.state.value;
		if (props.multiple) {
			(prevValues || []).map((i) => {
				selectedValues[i] = true;
			})
			if (selectedValues[value]) {
				delete selectedValues[value];
			} else {
				selectedValues[value] = true;
			}

			stateValue = Object.keys(selectedValues);
		} else {
			if (prevValues != value) {
				stateValue = value;
			}
		}


		var onChange = props.onChange;
		if (onChange) {
			onChange(e, index, stateValue);
		} else {
			this.setState({
				value: stateValue
			})
		}
	}

	_onFocus (e) {
		this.setState({
			isFocused: true
		})
	}

	_onBlur (e) {
		this.setState({
			isFocused: false
		})
	}

	render () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;

		var value = stateObj.value;

		var labels = [];
		var selectedValues = {};
		
		if (Array.isArray(value)) {
			value.map((i) => {
				selectedValues[i] = true;
			})
		} else {
			selectedValues[value] = true;
		}

		var style = Object.assign({
			marginTop: '15px',
			paddingTop: '20px',
			position: 'relative',
			outline: 'none'
		}, props.style || null);

		// if (isFocused) {
			style.overflow = 'visible';
		// }

		var selectedMenuItemStyle = props.selectedMenuItemStyle || {};

		var MenuItems = props.options.map((item, index) => {
			var val = item.value;
			var selected = selectedValues[val] ? true : false;
			var ES = {}; // extendedStyle
			if (selected) {
				ES = selectedMenuItemStyle;
				labels.push(item.label);
			}
			return (
				<Item key={val} selected={selected} extendedStyle={ES} onClick={self._onItemClick} data={item} index={index}/>
			);
		})

		var floatingLabelText = props.floatingLabelText || null;

		var floatingLabelStyle = {
			position: 'absolute',
			transition: 'all .15s linear'
		}

		var flsExt = { // floatingLabelStyleExtended
			color: '#bbb',
			top: '0px',
			fontSize: '.9em'
		}; 

		var isFocused = stateObj.isFocused;

		if (!labels.length) {
			flsExt.top = '17px',
			flsExt.fontSize = '1.2em';
		}

		Object.assign(floatingLabelStyle, flsExt);

		var label = labels.join(', ');

		return (
			<div
				style={style}
				tabIndex={-1}
				onFocus={this._onFocus}
				onBlur={this._onBlur}
				>
				<div
					style={{
						position: 'absolute',
						top: '0px',
						zIndex: '1000',
						width: '100%',
						transform: isFocused ? 'scale(1, 1)' : 'scale(1, 0)',
						transition: 'transform .2s ease-in-out',
						// padding: '15px 0px',
						boxShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 10px, rgba(0, 0, 0, 0.23) 0px 3px 10px',
						maxHeight: '400px', // **Should i consider screen width here? instead of setting a constant value
						overflow: 'auto'
					}}
					>
					{MenuItems}
				</div>
				<div style={{padding: '1px 0px'}}>
					{label || <div style={{visibility: 'hidden'}}>Empty</div>}
				</div>
				<div
					style={floatingLabelStyle}
					>
					{floatingLabelText}
				</div>
				<div
					style={{
						borderBottom: '1px solid #ccc',
						position: 'absolute',
						bottom: '0px',
						width: '100%'
					}}
					/>
			</div>

		);
	}
}