import React, { Component } from 'react';

export default class Checkbox extends Component {
	constructor (props) {
		super(props);
		var self = this;

		this.state = {
			checked: props.checked
		};

		[
			'_onChange'
		].map((i) => {
			self[i] = self[i].bind(self);
		})

	}

	componentWillReceiveProps (nextProps) {
		this.setState({
			checked: nextProps.checked
		})
	}

	_onChange (e) {
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
		var stateObj = this.state;
		var props = this.props;

		var style = props.style || null;
		var label = props.label || '';

		var checked = stateObj.checked;

		// Need to show the floating label text

		return (
			<div
				style={style}
				>
				<div style={{display: 'inline-block', position: 'relative'}}>
					<input type='checkbox' checked={checked} onChange={this._onChange} style={{width: '25px', height: '13px', opacity: '0', position: 'relative', zIndex: '2'}}/>
					<div
						style={{
							position: 'absolute',
							border: checked ? 'none' : '1px solid #aaa',
							borderRadius: '3px',
							top: '2px',
							left: '2px',
							width: '15px',
							height: '15px',
							backgroundColor: checked ? '#38dc38' : 'white',
							transition: 'all .2s linear'
						}}
						>
						{checked ?<span style={{color: 'white', fontSize: '.85em', marginLeft: '3px', display: 'inline-block', verticalAlign: 'top'}}>&#10004;</span> : null}
					</div>
				</div>
				<span style={{verticalAlign: 'top'}}>{label}</span>
			</div>

		);
	}
}