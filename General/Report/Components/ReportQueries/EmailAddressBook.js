import React from 'react';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Select from 'react-select';
import ClearIcon from 'material-ui/svg-icons/content/clear';

import ReactStickyTable from '../General/react-sticky-table';
import TopLoader from '../General/TopLoader';

import LoginStore from '../../Stores/LoginStore';
import ReportStore from '../../Stores/ReportStore';

import commonFunctions from '../../Utils/commonFunctions';
import ServerAPI from '../../Utils/ServerAPI'

export default class EmailAddressBook extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			subject: "",
			property: null,
			loaderArr: [{state: 'transit', title: 'Component rendering in progress!'}],
			dateTo: null,
			dateFrom: null
		}

		this.shouldComponentUpdate = commonFunctions.defaultShouldComponentUpdate;
		this.getLoaderArr = commonFunctions.getLoaderArr.bind(this);

		this._onValueChange = this._onValueChange.bind(this);
		this._onDateValueChange = this._onDateValueChange.bind(this);
		this._onTextValueChange = this._onDateValueChange;
		this.pof_preRequestCheck = this.pof_preRequestCheck.bind(this);

		this.excludeFieldsData = [
			{
				label: 'Body',
				value: 'Body'
			}, {
				label: 'Date-Time',
				value: 'DateTime'
			}, {
				label: 'Status',
				value: 'Status'
			}, {
				label: 'Subject',
				value: 'Subject'
			}, {
				label: 'Building Name',
				value: 'BuildingID'
			}
		];

		this.excludeFieldsData.map(function (item) {item.selected = false;});
		this.excludeFieldsData[0].selected = true;
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
		this.setState({
			[key]: value
		});
	}

	_onDateValueChange (key, e, value) {
		this.setState({
			[key]: value
		});
	}

	pof_preRequestCheck (data) {
		var self = this;
		var stateObj = this.state;

		var serverFn = data.serverFn;

		if (ReportStore.checkIfUpdateRequired(data.key, data.MID)) {
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
		var property = stateObj.property;

		var containerStyle = {

		}

		this.pof_preRequestCheck({
			key: 'property',
			serverFn: 'getPropertyList',
			title: 'Loading Property List'
		});

		return (
			<div ref="container" style={containerStyle}>
				<TopLoader data={stateObj.loaderArr}/>
				<div className="row">
					<div className="col-sm-12 text-center">
						<TextField
					      floatingLabelText="Subject"
					      value={stateObj.subject}
				          onChange={this._onTextValueChange.bind(this, 'subject')}
				          style={{minWidth: '400px'}}
					    />
					</div>
				</div>

				<div className="row">
					<div className="col-sm-12 text-center">
						<div style={{display: 'inline-block', margin: '10px 10px 0px', position: 'relative'}}>
							<DatePicker value={stateObj.dateFrom} hintText="From" container="inline" onChange={this._onDateValueChange.bind(this, 'dateFrom')}/>
							{stateObj.dateFrom ?
								<span style={{position: 'absolute', right: '0px', top: '15px', cursor: 'pointer'}} onClick={() => this.setState({dateFrom: null})}>
									<ClearIcon style={{height: '20px', width: '20px', fill: '#ccc'}}/>
								</span> : null}
						</div>
						<div style={{display: 'inline-block', margin: '10px 10px 0px', position: 'relative'}}>
							<DatePicker value={stateObj.dateTo} hintText="To" container="inline" onChange={this._onDateValueChange.bind(this, 'dateTo')}/>
							{stateObj.dateTo ?
								<span style={{position: 'absolute', right: '0px', top: '15px', cursor: 'pointer'}} onClick={() => this.setState({dateTo: null})}>
									<ClearIcon style={{height: '20px', width: '20px', fill: '#ccc'}}/>
								</span> : null}
						</div>
					</div>
					
				</div>

				<div className="row">
					<div className="col-sm-12">
						<div style={{width: '400px', margin: '30px auto 15px', maxWidth: '100%'}}>
							<Select 
								ref="property"
		            			placeholder="Select Property"
		            			options={ReportStore.getPropertyList().map(function (item) {return {label: item.BuildingName, value: item.Did};})}
		            			value={property}
		            			onChange={(val) => {
		            				self.setState({property: val});
		            			}} />
						</div>
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
