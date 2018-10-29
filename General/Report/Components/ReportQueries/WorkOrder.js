import React from 'react';
import Checkbox from 'material-ui/Checkbox';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import AutoComplete from 'material-ui/AutoComplete';
import MenuItem from 'material-ui/MenuItem';
import Select from 'react-select';
import ClearIcon from 'material-ui/svg-icons/content/clear';

import TopLoader from '../General/TopLoader';

import LoginStore from '../../Stores/LoginStore';
import ReportStore from '../../Stores/ReportStore';

import commonFunctions from '../../Utils/commonFunctions';
import ServerAPI from '../../Utils/ServerAPI';

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(function (item, index) {
	return {label: item, value: index + 1};
})

var years = [];
for (var i = 2016; i < (new Date()).getFullYear() + 1; i++) years.push({label: i.toString(), value: i});

var quarters = ['Q1', 'Q2', 'Q3', 'Q4'].map(function (item, index) {
	return {label: item, value: item};
})

var selectDefaultStyle = {
	width: '400px',
	margin: 'auto',
	display: 'block',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	maxWidth: '100%',
	position: 'relative'
}

var requestTypeDataLoaded = false;
var requestTypeData = [];

export default class WorkOrder extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			status: "",
			dateType: "",
			month: ['__clear_all__'],
			year: ['__clear_all__'],
			quarter: ['__clear_all__'],
			requestType: ['__clear_all__'],
			loaderArr: [{state: 'transit', title: 'Component rendering in progress!'}],
			primaryFilterOption: 'Property Manager',
			property: ['__clear_all__'],
			city: ['__clear_all__'],
			propertyManager: ['__clear_all__']
		}

		this.shouldComponentUpdate = commonFunctions.defaultShouldComponentUpdate;
		this.getLoaderArr = commonFunctions.getLoaderArr.bind(this);

		this._onValueChange = this._onValueChange.bind(this);
		this.render_dateTypeFilter = this.render_dateTypeFilter.bind(this);
		this.render_primaryOptionFilter = this.render_primaryOptionFilter.bind(this);
		this.pof_preRequestCheck = this.pof_preRequestCheck.bind(this);

		this.excludeFieldsData = [
			{
				label: 'Property Name',
				value: 'PropertyBuildingText',
				primary: true
			}, {
				label: 'Property Manager',
				value: 'PropertyManager',
				//primary: true
			}, {
				label: 'Building Op', // Is this okay?
				value: 'BuildingOp'
			}, {
				label: 'Request Type',
				value: 'RequestTypeText',
				primary: true
			}, {
				label: 'Tenant Name',
				value: 'TenantNameText',
				primary: true
			}, {
				label: 'Suite',
				value: 'SuiteText',
				primary: true
			}, {
				label: 'Floor',
				value: 'FloorText',
				primary: true
			}, {
				label: 'City',
				value: 'City',
				//primary: true
			}, {
				label: 'Date Opened',
				value: 'RequestDate',
				primary: true
			}, {
				label: 'Date Closed (If Closed)',
				value: 'UpdatedDate',
				primary: true
			}, {
				label: 'Processing Time',
				value: 'ProcessingTime'
			}, {
				label: 'Emergency',
				value: 'Emergency'
			}
		];

		this.primaryFilterOptionData = ['Property Manager', 'City', 'Property'].map(function (item) {
			return {label: item, value: item};
		})

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
		var self = this;
		if (!requestTypeDataLoaded) {
			this.setState({
				loaderArr: this.getLoaderArr({id: 'getRequestTypes', title: 'Loading Request Types', state: 'loading'})
			})

			ServerAPI.getRequestTypes(null, function (res) {
				if (res.Status == "Success") {
					requestTypeData = JSON.parse(res.Data).map(function (item) {
						return item["0"];
					})
					requestTypeDataLoaded = true;
				}
				self.setState({
					loaderArr: self.getLoaderArr({id: 'getRequestTypes'}, 'delete')
				})
			})
		}
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

	render_dateTypeFilter (type) {
		var self = this;
		var stateObj = this.state;

		if (type == "Month") {
			return (
				<div style={{position: 'relative'}}>
					
					<SelectField
			        	floatingLabelText="Month"
			          	value={stateObj.month}
			          	onChange={this._onValueChange.bind(this, 'month')}
			          	style={selectDefaultStyle}
			          	multiple
		          		selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
			        >
		        		<MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
			        	{/*<MenuItem value={'__clear_all__'} primaryText={'Clear Item'} style={{color: 'white', backgroundColor: '#8b5656'}} />*/}
			        	{months.map(function (item, index) {
			        		return (
			        			<MenuItem key={index} value={item.value} primaryText={item.label} />
			        		);
			        	})}
				        
			        </SelectField>

			        

			        <SelectField
			        	floatingLabelText="Year"
			          	value={stateObj.year}
			          	onChange={this._onValueChange.bind(this, 'year')}
			          	style={selectDefaultStyle}
			          	multiple
		          		selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
			        >
			        	<MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
			        	{/*<MenuItem value={'__clear_all__'} primaryText={'Clear Item'} style={{color: 'white', backgroundColor: '#8b5656'}} />*/}
			        	{years.map(function (item, index) {
			        		return (
			        			<MenuItem key={index} value={item.value} primaryText={item.label} />
			        		);
			        	})}
			        </SelectField>
				</div>
			);
		} else if (type == "Quarter") {
			return (
				<div>
					<SelectField
			        	floatingLabelText="Quarter"
			          	value={stateObj.quarter}
			          	onChange={this._onValueChange.bind(this, 'quarter')}
			          	style={selectDefaultStyle}
			          	multiple
		          		selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
			        >
			        	<MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
			        	{/*<MenuItem value={'__clear_all__'} primaryText={'Clear Item'} style={{color: 'white', backgroundColor: '#8b5656'}} />*/}
			        	{quarters.map(function (item, index) {
			        		return (
			        			<MenuItem key={index} value={item.value} primaryText={item.label} />
			        		);
			        	})}
			        </SelectField>

			        <SelectField
			        	floatingLabelText="Year"
			          	value={stateObj.year}
			          	onChange={this._onValueChange.bind(this, 'year')}
			          	style={selectDefaultStyle}
			          	multiple
		          		selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
			        >
			        	<MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
			        	{/*<MenuItem value={'__clear_all__'} primaryText={'Clear Item'} style={{color: 'white', backgroundColor: '#8b5656'}} />*/}
			        	{years.map(function (item, index) {
			        		return (
			        			<MenuItem key={index} value={item.value} primaryText={item.label} />
			        		);
			        	})}
			        </SelectField>
				</div>
			);
		} else if (type == "Year") {
			return (
				<div>
			        <SelectField
			        	floatingLabelText="Year"
			          	value={stateObj.year}
			          	onChange={this._onValueChange.bind(this, 'year')}
			          	style={selectDefaultStyle}
			          	multiple
		          		selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
			        >
			        	<MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
			        	{/*<MenuItem value={'__clear_all__'} primaryText={'Clear Item'} style={{color: 'white', backgroundColor: '#8b5656'}} />*/}
			        	{years.map(function (item, index) {
			        		return (
			        			<MenuItem key={index} value={item.value} primaryText={item.label} />
			        		);
			        	})}
			        </SelectField>
				</div>
			);
		}
		return null;
	}

	render_primaryOptionFilter () {
		var self = this;
		var stateObj = this.state;
		var primaryFilterOption = stateObj.primaryFilterOption;

		if (primaryFilterOption == 'Property Manager') {
			this.pof_preRequestCheck({
				key: 'propertyManager',
				serverFn: 'getPropertyManagerList',
				title: 'Loading Property Manager List'
			});

			return (
				<SelectField
		        	floatingLabelText="Property Manager"
		          	value={stateObj.propertyManager}
		          	onChange={this._onValueChange.bind(this, 'propertyManager')}
			        style={selectDefaultStyle}
		          	multiple
		          	selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
		        >
		        	<MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
		        	{ReportStore.getPropertyManagerList().map(function (item, index) {
		        			//<MenuItem key={index} value={item.Did} primaryText={item['First Name'] + " " + item['Last Name']} />
		        		return (
		        			<MenuItem key={index} value={item['First Name'] + " " + item['Last Name']} primaryText={item['First Name'] + " " + item['Last Name']} />
		        		);
		        	})}
		        </SelectField>
			);
		} else if (primaryFilterOption == 'City') {
			this.pof_preRequestCheck({
				key: 'city',
				serverFn: 'getCityList',
				title: 'Loading City List'
			});

			return (
				<SelectField
		        	floatingLabelText="City"
		          	value={stateObj.city}
		          	onChange={this._onValueChange.bind(this, 'city')}
			        style={selectDefaultStyle}
		          	multiple
		          	selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
		        >
		        	<MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
		        	{ReportStore.getCityList().map(function (item, index) {
		        		return (
		        			<MenuItem key={index} value={item.City} primaryText={item.City} />
		        		);
		        	})}
		        </SelectField>
			);
		} else if (primaryFilterOption == 'Property') {
			this.pof_preRequestCheck({
				key: 'property',
				serverFn: 'getPropertyList',
				title: 'Loading Property List'
			});

			return (
				<div style={{width: '400px', margin: '30px auto 15px', maxWidth: '100%'}}>
					<Select 
						ref="property"
            			placeholder="Select Property"
            			options={ReportStore.getPropertyList().map(function (item) {return {label: item.BuildingName, value: item.Did};})}
            			multi={true}
            			value={stateObj.property}
            			onChange={(val) => {
            				val = val || [];
            				self.setState({property: val});
            			}} />
				</div>
			);
		} else {
			return null;
		}
	}

	pof_preRequestCheck (data) {
		var self = this;
		var stateObj = this.state;

		var serverFn = data.serverFn;

		if (ReportStore.checkIfUpdateRequired(data.key)) {
			if (stateObj.loaderArr.find(function (item) {return item.id == serverFn;})) return;
			setTimeout(function () {
				ServerAPI[serverFn](null, function (res) {
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

		var containerStyle = {

		}

		var statusData = [
			{
				label: 'Open',
				value: 'Open'
			}, {
				label: 'Close',
				value: 'Close'
			}, {
				label: 'Re-assign',
				value: 'ReAssign'
			}, {
				label: 'Acknowledge',
				value: 'Acknowledge'
			}
		];

		var dateTypeData = [
			{
				label: 'Month',
				value: 'Month'
			}, {
				label: 'Quarter',
				value: 'Quarter'
			}, {
				label: 'Year',
				value: 'Year'
			}
		];

		//var requestTypeData = ["Other", "Plumbing - Kitchen", "Elevators", "TR 4 Test Escalation", "RT420W", "Roof", "Shipping / Receiving", "Heating (incl. Baseboard heaters)", "Building Doors", "Building Exterior", "Light Fixtures and Devices (Office / Hallways)", "Windows", "Fire and Life Safety", "Plumbing - Bathrooms", "Noise ", "Electrical", "Access Cards/ FOBs/ Keys", "Security", "Parking", "Escalators", "Cleaning Office", "Items for Pick Up", "Garbage Removal", "Odor", "Pest Control"].map(function (item) {return {label: item, value: item};});

		if (this.props.type == 'requestType') {
			this.pof_preRequestCheck({
				key: 'request',
				serverFn: 'getRequestList',
				title: 'Loading Request List'
			});
		} 

		return (
			<div ref="container" style={containerStyle}>
				<TopLoader data={stateObj.loaderArr}/>
				<div className="row">
					{this.props.type == 'requestType' ? 
						<div className="col-sm-4">
							<SelectField
					        	floatingLabelText="Request Type"
					          	value={stateObj.requestType}
					          	onChange={this._onValueChange.bind(this, 'requestType')}
					          	style={selectDefaultStyle}
					          	multiple
		          				selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
					        >
					        	{ReportStore.getRequestList().map(function (item, index) {
					        		return (
					        			<MenuItem key={index} value={item.Did} primaryText={item.RequestType} />
					        		);
					        	})}
					        </SelectField>
						</div> : null
					}

					<div className="col-sm-4">
						<SelectField
				        	floatingLabelText="Manager/City/Property"
				          	value={stateObj.primaryFilterOption}
				          	onChange={this._onValueChange.bind(this, 'primaryFilterOption')}
					        style={selectDefaultStyle}
		          			selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
				        >
			        		<MenuItem value={'__clear_all__'} primaryText={'Clear Item'} style={{color: 'white', backgroundColor: '#8b5656'}} />
				        	{this.primaryFilterOptionData.map(function (item, index) {
				        		return (
				        			<MenuItem key={index} value={item.value} primaryText={item.label} />
				        		);
				        	})}
				        </SelectField>

				        {this.render_primaryOptionFilter()}

					</div>

					<div className="col-sm-4">
						<SelectField
				        	floatingLabelText="Status"
				          	value={stateObj.status}
				          	onChange={this._onValueChange.bind(this, 'status')}
					        style={selectDefaultStyle}
		          			selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
				        >
			        		<MenuItem value={'__clear_all__'} primaryText={'Clear Item'} style={{color: 'white', backgroundColor: '#8b5656'}} />
				        	{statusData.map(function (item, index) {
				        		return (
				        			<MenuItem key={index} value={item.value} primaryText={item.label} />
				        		);
				        	})}
				        </SelectField>
					</div>

					<div className="col-sm-4">
						<SelectField
				        	floatingLabelText="Date-type"
				          	value={stateObj.dateType}
				          	onChange={this._onValueChange.bind(this, 'dateType')}
					        style={selectDefaultStyle}
		          			selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
				        >
			        		<MenuItem value={'__clear_all__'} primaryText={'Clear Item'} style={{color: 'white', backgroundColor: '#8b5656'}} />
				        	{dateTypeData.map(function (item, index) {
				        		return (
				        			<MenuItem key={index} value={item.value} primaryText={item.label} />
				        		);
				        	})}
				        </SelectField>

				        {stateObj.dateType ? 
				        	this.render_dateTypeFilter(stateObj.dateType) : null
				        }

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
