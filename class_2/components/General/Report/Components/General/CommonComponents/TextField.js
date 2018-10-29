import React, { Component } from 'react';

export default class TextField extends Component {
	constructor (props) {
		super(props);
		var self = this;

		this.state = {
			value: props.defaultValue || props.value,
			isFocused: false
		};

		[
			'_onChange',
			'_onFocus',
			'_onBlur'
		].map((i) => {
			self[i] = self[i].bind(self);
		})

	}

	componentWillReceiveProps (nextProps) {
		if ('value' in nextProps) {
			this.setState({
				value: nextProps.value
			})
		}
	}

	_onChange (e) {
		var props = this.props;
		var val = e.target.value;
		var onChange = props.onChange;
		if (onChange) {
			onChange(e, val);
		} else {
			this.setState({
				value: val
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

		var style = Object.assign({
			marginTop: '15px',
			paddingTop: '20px',
			position: 'relative'
		}, props.style || null);
		var floatingLabelText = props.floatingLabelText || null;

		var floatingLabelStyle = {
			position: 'absolute',
			transition: 'all .2s ease-in-out'
		}

		var flsExt = { // floatingLabelStyleExtended
			color: '#bbb',
			top: '0px',
			fontSize: '.9em'
		}; 

		var isFocused = stateObj.isFocused;

		if (!isFocused && !value) {
			flsExt.top = '17px',
			flsExt.fontSize = '1.2em';
		} else if (isFocused) {
			flsExt.color = '#589c9c';
			flsExt.fontWeight = 'bold';
		}

		Object.assign(floatingLabelStyle, flsExt);

		return (
			<div
				style={style}
				>
				<div
					style={floatingLabelStyle}
					>
					{floatingLabelText}
				</div>
				<input 
					onChange={this._onChange}
					onFocus={this._onFocus}
					onBlur={this._onBlur}
					style={{
						border: 'none',
						width: '100%',
						outline: 'none',
						position: 'relative',
						background: 'transparent'
					}}
					value={value}
					id={props.id || null}
					name={props.name || null}
					/>
				<div
					style={{
						borderBottom: '1px solid #ccc',
						position: 'absolute',
						bottom: '0px',
						width: '100%'
					}}
					>
					<div
						style={{
							borderBottom: '2px solid cyan',
							position: 'relative',
							transition: 'width .2s linear',
							width: isFocused ? '100%' : '0%',
							margin: '0px auto -1px'
						}}
						/>
				</div>	
			</div>

		);
	}
}