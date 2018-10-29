import React from 'react';
import Checkbox from 'material-ui/Checkbox';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Select from 'react-select';

import ReactStickyTable from '../General/react-sticky-table';
import TopLoader from '../General/TopLoader';

import LoginStore from '../../Stores/LoginStore';
import ReportStore from '../../Stores/ReportStore';

import commonFunctions from '../../Utils/commonFunctions';
import ServerAPI from '../../Utils/ServerAPI';

var selectDefaultStyle = {
	width: '400px',
	margin: 'auto',
	display: 'block',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	maxWidth: '100%'
}

export default class TenantAddressBook extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			status: "",
			loaderArr: [{state: 'transit', title: 'Component rendering in progress!'}],
			property: null,
			tenant: []
		}

		this.shouldComponentUpdate = commonFunctions.defaultShouldComponentUpdate;
		this.getLoaderArr = commonFunctions.getLoaderArr.bind(this);

		this._onValueChange = this._onValueChange.bind(this);
		this.pof_preRequestCheck = this.pof_preRequestCheck.bind(this);

		this.excludeFieldsData = [
			{
				label: 'Building ID',
				value: 'BuildingID'
			}, {
				label: 'First Name',
				value: 'FirstName'
			}, {
				label: 'Last Name',
				value: 'LastName'
			}, {
				label: 'Tenant Name',
				value: 'TenantName'
			}, {
				label: 'Phone',
				value: 'Phone'
			}, {
				label: 'Email Address',
				value: 'EmailAddress'
			}, {
				label: 'Title',
				value: 'Title'
			}/*, {
				label: 'Emergency Contact',
				value: 'EmergencyContact'
			}*/
		];

		this.excludeFieldsData.map(function (item) {item.selected = false;});
	}

	/*getQueryRelatedObj () {
		var stateObj = this.state;
		var keyValuePair = {};
		(location.hash.substr(1).split('/')[this.__queryIndex] || "").split('&').map(function (item, index) {
			var splitItem = item.split('=');
			var key = splitItem[0];
			if (key_stateKey[key]) key = key_stateKey[key];
			if (key in stateObj) {
				keyValuePair[key] = encodeURIComponent(splitItem[1]);
			}
		})
		return keyValuePair;
	}

	componentWillReceiveProps () {
		var keyValuePair = this.getQueryRelatedObj();

		if (Object.keys(keyValuePair).length) {
			this.setState(keyValuePair);
		} else {
			this.__denyUpdate = true;
		}
	}*/


	_onTableParamChange (key, value, e) {
		var newState = null;
		if (key == "pageNumber") {
			newState = {pageNumber: value};
		} else if (key.search('sortingOrder') == 0) {
			newState = {sortingOrder: value};
		} else if (key.search('sortingIndex') == 0) {
			newState = {sortingIndex: value, sortingOrder: -1};
		}
		if (newState) window.navigate(this.__rootRoute + this.buildQuery(newState));
	}

	/*buildQuery (newState) {
		var stateObj = this.state;
		var tableParamObj = {};
		basicTableState.map(function (key) {tableParamObj[key] = stateObj[key];});
		if (newState) {
			Object.keys(newState).map(function (key) {
				tableParamObj[key] = newState[key];
			});
		}

		var query = [];

		Object.keys(key_stateKey).map(function (urlKey) {
			var key = key_stateKey[urlKey];
			if (tableParamObj[key] !== defaultTableState[key]) {
				query.push(urlKey + "=" + tableParamObj[key]);
			}
		})

		if (query.length) {
			return "/" + query.join("&");
		} else return "/0";
	}*/

	_changeHandler () {
		
	}

	componentDidMount () {
		
	}

	componentWillUnmount () {

	}

	componentDidUpdate () {

	}

	_onValueChange (key, e, index, value) {
		var val;
		if (Array.isArray(value)) {
			if (value[value.length - 1] == '__clear_all__') {
				val = ['__clear_all__'];
			} else if (value[0] == '__clear_all__' && value.length > 1) {
				value.shift();
				val = value;
			} else val = value;
		} else if (value == '__clear_all__') {
			val = '';
		} else {
			val = value;
		}
		this.setState({
			[key]: val
		});
	}

	pof_preRequestCheck (data) {
		var self = this;
		var stateObj = this.state;

		var serverFn = data.serverFn;

		if (ReportStore.checkIfUpdateRequired(data.key, data.MID)) {
			if (stateObj.loaderArr.find(function (item) {return item.id == serverFn;})) return;
			setTimeout(function () {
				var sendData = {
					MID: data.MID
				}
				ServerAPI[serverFn.split('-')[0]](sendData, function (res) {
					self.setState({
						loaderArr: self.getLoaderArr([{
							id: serverFn
						}], 'delete')
					})
				})
				self.setState({
					loaderArr: self.getLoaderArr([{
						state: 'loading',
						title: data.title || 'Loading',
						id: serverFn
					}])	
				})
			}, 200);
		}
	}

	render () {
		var self = this;
		var stateObj = this.state;
		var property = stateObj.property;

		var containerStyle = {

		}

		this.pof_preRequestCheck({
			key: 'property',
			serverFn: 'getPropertyList',
			title: 'Loading Property List'
		});

		var MID = null;

		if (property) {
			MID = property.value;
			this.pof_preRequestCheck({
				key: 'tenant',
				serverFn: 'getTenantList' + '-' + MID,
				title: 'Loading Tenant List',
				MID: MID
			});
		}

		var tenantList = MID ? ReportStore.getTenantList(MID) : null;
		if (!tenantList) tenantList = [];
		else tenantList = tenantList.data;

		return (
			<div ref="container" style={containerStyle}>
				<TopLoader data={stateObj.loaderArr}/>
				<div className="row">
					<div className="col-sm-6">
						<div style={{width: '400px', margin: '30px auto 15px', maxWidth: '100%'}}>
							<Select 
								ref="property"
		            			placeholder="Select Property"
		            			options={ReportStore.getPropertyList().map(function (item) {return {label: item.BuildingName, value: item.Did};})}
		            			value={stateObj.property}
		            			onChange={(val) => {
		            				self.setState({property: val, tenant: []});
		            			}} />
						</div>
					</div>

					<div className="col-sm-6">
						<SelectField
				        	floatingLabelText="Tenant"
				          	value={stateObj.tenant}
				          	onChange={this._onValueChange.bind(this, 'tenant')}
				          	style={selectDefaultStyle}
				          	multiple
		          			selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
				        >
		        			<MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
				        	{MID ? 
				        		tenantList.map(function (item, index) {
					        		return (
					        			<MenuItem key={index} value={item.CompanyId} primaryText={item.TenantName} />
					        		);
					        	}) : null
				        	}
				        </SelectField>
					</div>
					
				</div>

				<div className="row">
					<div className="col-sm-12" style={{margin: '15px 0px 6px'}}>
						<h4 style={{textDecoration: 'underline', marginLeft: '15px'}}>Exclude Fields:</h4>

						{this.excludeFieldsData.map(function (item, index) {
							return (
								<div key={index} style={{display: 'inline-block', margin: '6px 12px'}}>
									<Checkbox
								      label={item.label}
								      checked={item.selected}
								      onCheck={(e, value) => {
								      	item.selected = value;
								      	self.forceUpdate();
								      }}
								      style={{
								      	whiteSpace: 'nowrap'
								      }}
								    />
								</div>
							);
						})}
					</div>
				</div>
			</div>
		)
	}
}
