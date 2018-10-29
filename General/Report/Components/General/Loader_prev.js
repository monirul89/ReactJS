import React from 'react';

import LoginStore from "../../Stores/LoginStore";

import manualAlert from "../../Utils/manualPrompter";

var LoaderObj = [];
export default class Loader extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			index: LoaderObj.length,
			forceHide: false
		}

		this._changeHandler = this._changeHandler.bind(this);
		this._handleResize = this._handleResize.bind(this);
		LoaderObj.push(this);
	}

	_handleResize () {
		var self = this;
		var parentClientRect = self.containerObj.getBoundingClientRect();
		var windowInnerHeight = window.innerHeight;
		var topPos = parentClientRect.top;
		var bottomPos = parentClientRect.bottom;
		var additionalHeight = 0;
		if (topPos < 0) {
			additionalHeight = -(topPos); 
			topPos = 0;
		}
		topPos = topPos > 0 ? topPos : 0;
		bottomPos =  bottomPos > windowInnerHeight ? windowInnerHeight : bottomPos;
		self.centeredBlock.style.top = additionalHeight + (((bottomPos - topPos) - self.centeredBlock.offsetHeight) / 2) + "px";
	}

	_changeHandler () {
		if (!LoginStore.getAuthorizationStatus()) {
			this.setState({
				forceHide: true
			})
			manualAlert("Please Log in!", "Unauthorized", {type: 'danger', transitionEffect: {in: 'slideInDown', out: 'slideOutUp'}});
		}
	}

	componentDidMount () {
		LoginStore.addChangeListener(this._changeHandler);
		this.centeredBlock = LoaderObj[this.state.index].refs['center-block'];
		this.containerObj = this.centeredBlock.parentNode;
		this.masterContainer = this.containerObj.parentNode;

		window.addEventListener('resize', this._handleResize);
		
		this._handleResize();
	}

	componentWillUnmount () {
		LoginStore.removeChangeListener(this._changeHandler);
		window.removeEventListener('resize', this._handleResize);
	}

	componentDidUpdate () {
		this._handleResize();
	}

	render () {
		var displayValue = this.props.state == "loading" ? (this.state.forceHide ? "none" : "block") : 'none';

		var loaderStyle = {
			position: 'absolute',
			width: '100%',
			height: '100%',
			top: '0px',
			left: '0px',
			backgroundColor: 'rgba(255, 255, 255, 0.77)',
			display: displayValue,
			textAlign: 'center',
			zIndex: this.props.masterLoader === true ? 10 : 2
		}

		var titleStyle = {
			color: "#2F6E87",
			fontSize: '21px'
		}

		return (
			<div style={loaderStyle}>
				<div ref="center-block" style={{height: 'auto', width: '100%', position: 'absolute'}}>
					<div className="spinner" style={{display: 'block', 'paddingBottom': '15px'}}>
						{/*<i className="fa fa-spinner fa-pulse fa-3x fa-fw fa-spin" style={{color: '#56729e'}}></i>*/}
					</div>
					<div style={titleStyle}>
						{this.props.title}
					</div>
				</div>
			</div>
		)
	}
}
