import React, { Component } from 'react';

export default class MenuItem extends Component {
	constructor (props) {
		super(props);
		var self = this;

		this.state = {
			value: props.value
		};

		[
			'_onChange'
		].map((i) => {
			self[i] = self[i].bind(self);
		})

	}

	componentWillReceiveProps (nextProps) {
		this.setState({
			value: nextProps.value
		})
	}

	_onChange (e) {
		var props = this.props;
		var val = e.target.value;
		var onChange = props.onChange;
		if (onChange) {
			onChange(e, value);
		} else {
			this.setState({
				value: val
			})
		}
	}

	render () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;

		var style = props.style || null;
		var floatingLabelText = props.floatingLabelText || null;

		return (
			<div
				style={style}
				>
				<input value={stateObj.value} />

			</div>

		);
	}
}