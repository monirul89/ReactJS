import React from 'react';
import ModifyBuilding from '../Property_Building/ModifyBuilding';
import ModifyProperty from '../Property_Building/ModifyProperty';
import ModifyFloor from '../Floor_Location/ModifyFloor';
import ModifyLocation from '../Floor_Location/ModifyLocation';
import ModifyEquipment from '../Equipment/ModifyEquipment';
import ModifySpecificEquipment from '../Equipment/ModifySpecificEquipment';
import ModifyGauge from '../Equipment/ModifyGauge';
import ModifySystemStandard from '../Equipment/ModifySystemStandard';
import ModifyCategory from '../Equipment/ModifyCategory';

export default class ModifyItem extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			selectedPage: props.selectedPage || null
		}

		this.denyUpdate = false;
		this._goBack = this._goBack.bind(this);
	}

	shouldComponentUpdate () {
		if (this.denyUpdate) {
			this.denyUpdate = false;
			return false;
		} else {
			return true;
		}
	}

	componentWillReceiveProps (nextProps) {
		if (this.state.selectedPage != nextProps.selectedPage) {
			this.setState({selectedPage: nextProps.selectedPage});
		} else {
			//this.denyUpdate = true;
		}
	}

	_setSelectedPage (item) {
		window.navigate(item.href);
		//this.setState({selectedPage: item.value || item.label});
	}

	getComponent () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;
		var items = props.items || [];
		var selectedPage = stateObj.selectedPage;

		if (selectedPage == "none" || !selectedPage) {
			return (
				items.map(function (item, index) {
					return (
						<div key={index} onClick={self._setSelectedPage.bind(self, item)} className="modify-item">
							<i className="fa fa-long-arrow-right" style={{position: 'absolute', right: '8px', verticalAlign: 'middle', top: '1px', height: '41px', lineHeight: '41px'}}></i>
							{item.label}
						</div>
					);
				})
			);
		} else if (selectedPage == "Property") {
			return (
				<ModifyProperty Did={props.Did} />
			);
		} else if (selectedPage == "Building") {
			return (
				<ModifyBuilding Did={props.Did} />
			);
		} else if (selectedPage == "Floor") {
			return (
				<ModifyFloor Did={props.Did}/>
			);
		} else if (selectedPage == "Location") {
			return (
				<ModifyLocation Did={props.Did} />
			);
		} else if (selectedPage == "Equipment") {
			return (
				<ModifyEquipment Did={props.Did}/>
			);
		} else if (selectedPage == "SpecificEquipment") {
			return (
				<ModifySpecificEquipment Did={props.Did} EquipmentId={props.EquipmentId}/>
			);
		} else if (selectedPage == "Gauge") {
			return (
				<ModifyGauge Did={props.Did}/>
			);
		} else if (selectedPage == "SystemStandard") {
			return (
				<ModifySystemStandard Did={props.Did}/>
			);
		} else if (selectedPage == "Category") {
			return (
				<ModifyCategory Did={props.Did} />
			);
		}
	}

	_goBack (e) {
		var props = this.props;
		if (props.rootRouter) {
			props.rootRouter();
		} else if (props.rootHref) {
			window.navigate(props.rootHref);
		} else {
			this.setState({selectedPage: 'none'});
		}
	}

	render () {
		var self = this;
		var stateObj = this.state;
		var selectedPage = stateObj.selectedPage;

		return (
			<div style={{padding: '15px 20px', padding: '30px 20px 15px', float: 'left', width: '100%', height: '100%', overflow: 'auto', backgroundColor: selectedPage && this.props.Did ? 'rgba(223, 233, 243, 0.24)' || 'rgba(229, 242, 243, 0.8)' || '#f1f2f3' : null}}>
				{/*selectedPage && selectedPage != "none"?
					<button onClick={this._goBack} className="btn btn-xs btn-default" style={{width: '28px', margin: '5px 0px'}}>
						<i className="fa fa-long-arrow-left"></i>
					</button> : null
				*/}
				{this.getComponent()}
			</div>
		);
	}
}
