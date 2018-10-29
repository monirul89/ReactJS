import React from 'react';

export default class TopLoader extends React.Component {
	constructor (props) {
		super(props);

		this.state = {

		}
	}

	render () {
		var props = this.props;

		var data = props.data || []; // Can add some validation and handle any type of input later maybe
		if (!Array.isArray(data)) data = [data];
		var loaderObj = null;
		data.find(function (item, index) {
			if (item.state == 'loading') {
				loaderObj = item;
			}
		})
		var title = loaderObj ? loaderObj.title : "";

		var containerStyle = {
			height: loaderObj ? "30px" : '0px', 
			position: 'absolute',
			backgroundColor: '#64a5ab', 
			left: '0px', 
			color: 'white',
			top: '0px', 
			width: '100%', 
			borderRadius: '0px 0px 5px 5px', 
			textAlign: 'center', 
			overflow: 'hidden', 
			transition: 'height .38s linear'
		};

		Object.assign(containerStyle, props.style || null);

		return (
			<div style={containerStyle}>
				<span
					style={{
					    padding: '6px 12px',
					    lineHeight: '30px',
					    verticalAlign: 'middle',
					    fontWeight: 'bold',
					    fontSize: '12px'
					}}>
					<i className={"fa fa-cog" + (loaderObj ? ' fa-spin' : '')} style={{margin: '0px 4px'}}></i>
					{title}
					{/*<i onClick={this.setState.bind(this, {loaderState: 'done'})} className="fa fa-close" style={{marginRight: '15px', float: 'right', verticalAlign: 'middle', lineHeight: '28px', cursor: 'pointer'}}></i>*/}
				</span>
			</div>
		)
	}
}
