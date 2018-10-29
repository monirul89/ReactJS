var React = require('react');

var PremisePanel = React.createClass({
	getInitialState: function () {
		//window.ondblclick = function () {
		//	if (this.state.expandedView) this._restoreUsual();
		//	else this._expand();
		//}.bind(this);

		return {
			expandedView: false
		}

	},

	_restoreUsual: function () {
		var body = document.body;
		var prevOverflow = body.__RST_prevOverflow;
		if (prevOverflow) {
			body.style.overflow = prevOverflow;
			delete body.__RST_prevOverflow;
		} else {
			body.style.removeProperty('overflow');
		}

		this.setState({
			expandedView: false
		})
	},

	_expand: function () {
		var body = document.body;
		var prevOverflow = body.style.overflow;
		if (prevOverflow) {
			body.__RST_prevOverflow = body.style.overflow;
		}
		body.style.overflow = "hidden";

		var container = this.refs['container'];

		container.style.width = (container.offsetWidth / window.innerWidth) * 100 + "%";
		container.style.top = container.getBoundingClientRect().top - body.getBoundingClientRect().top + "px";
		container.style.left = container.getBoundingClientRect().left - body.getBoundingClientRect().left + "px";
		container.style.position = "fixed";

		setTimeout(function () {
			this.setState({
				expandedView: true
			})
		}.bind(this), 50);

	},

	render: function () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;

		var containerStyle = stateObj.expandedView ?
		 	{
				borderColor: "#0e2d5b",
			    position: "fixed",
			    top: "0px",
			    left: "0px",
			    width: "100%",
			    zIndex: "99999999",
			    minHeight: "100%",
			    overflow: "auto",
			    height: "100%",
			    backgroundColor: 'white',
			    transition: 'all .4s ease-in-out'
			} : null

		return (
			<div ref="container" style={containerStyle}>
				<div className="panel panel-primary" style={{borderColor: '#0e2d5b'}}>
					<div className="panel-heading" style={{borderColor: '#0e2d5b', backgroundColor: '#33638d', position: 'relative'}}>
						{props.elementLeftHeading ?
							<div style={{position: 'absolute', top: '0px', left: '0px'}}>
								{props.elementLeftHeading}
							</div> : null}
						<div className="text-center" style={{color: '#ffffff', fontSize: '18px', fontWeight: 'bold'}}>{props.panelName}</div>
						{props.elementRightHeading ?
							<div style={{position: 'absolute', top: '0px', right: '0px'}}>
								{props.elementRightHeading}
							</div> : null}
						
					</div>

					<div className="panel-body" style={{overflow: 'auto', position: 'relative'}}>
						{props.children}
					</div>

					{props.elementFooter ?
						<div className="panel-footer">
							{props.elementFooter}
						</div> : null
					}
				</div>
			</div>
		)
	}
});

module.exports = PremisePanel;
