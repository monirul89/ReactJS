import React, { Component } from 'react';

var shadeBlend = function(p, c0, c1) {
    var n = p < 0 ? p * -1 : p,
        u = Math.round,
        w = parseInt;
    if (c0.length > 7) {
        var f = c0.split(","),
            t = (c1 ? c1 : p < 0 ? "rgb(0,0,0)" : "rgb(255,255,255)").split(","),
            R = w(f[0].slice(4)),
            G = w(f[1]),
            B = w(f[2]);
        return "rgb(" + (u((w(t[0].slice(4)) - R) * n) + R) + "," + (u((w(t[1]) - G) * n) + G) + "," + (u((w(t[2]) - B) * n) + B) + ")"
    } else {
        var f = w(c0.slice(1), 16),
            t = w((c1 ? c1 : p < 0 ? "#000000" : "#FFFFFF").slice(1), 16),
            R1 = f >> 16,
            G1 = f >> 8 & 0x00FF,
            B1 = f & 0x0000FF;
        return "#" + (0x1000000 + (u(((t >> 16) - R1) * n) + R1) * 0x10000 + (u(((t >> 8 & 0x00FF) - G1) * n) + G1) * 0x100 + (u(((t & 0x0000FF) - B1) * n) + B1)).toString(16).slice(1)
    }
}

export default class RaisedButton extends Component {
	constructor (props) {
		super(props);
		var self = this;

		this.state = {
			hovered: false
		};

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

		var style = props.style || null;
		var label = props.label || '';
		var {label, backgroundColor, hoverStyle} = props;

		var style = Object.assign({
			display: 'inline-block',
			padding: '6px 12px',
			borderRadius: '4px',
			// boxShadow: '0 1px 6px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.12)',
			cursor: 'pointer'
		}, props.style || null);

		if (backgroundColor) style.backgroundColor = backgroundColor;
		else backgroundColor = '#ffffff';

		if (stateObj.hovered) {
			if (hoverStyle) {
				Object.assign(style, hoverStyle);
			} else {
				style.backgroundColor = shadeBlend(.1, backgroundColor);
			}
		}

		var labelStyle = Object.assign({
			color: 'white',
			textTransform: 'uppercase'
		}, props.labelStyle || null);

		return (
			<div
				style={style}
				onClick={props.onClick || null}
				onMouseEnter={this._onMouseEnter}
				onMouseLeave={this._onMouseLeave}
				className={props.className || null}
				>
				<span style={labelStyle}>{label}</span>
			</div>

		);
	}
}