import React from 'react';

import InventoryStore from "../../Stores/InventoryStore";

import manualAlert from "../../Utils/manualPrompter";
import ServerAPI from "../../Utils/ServerAPI";
import commonFunctions from "../../Utils/commonFunctions";

import Modal from "../General/Modal";
import ModifyItem from "../General/ModifyItem";
import ReactStickyTable from "../General/react-sticky-table";

var basicTableState = {
	"filterValue": "",
	"pageNumber": 1,
	"sortingIndex": -1,
	"sortingOrder": 0
}

var basic_key_stateKey = {
	"fv": "filterValue",
	"fi": "filterItem",
	"pn": "pageNumber",
	"si": "sortingIndex",
	"so": "sortingOrder"
}

var basicStateObj = {
	modalView: false,
	loaderState: 'done',
	loaderTitle: 'Component Constructor Called!',
	tableData: [],
	showModalData: false,
	selectedPage: null,
	queryDid: null,
	childViewMode: false
}

var _limit = InventoryStore.getDefaultTableLengthLimit();
var _limitTweaked = _limit;

/*
 *
 *
	_showEquipment will not be added to prototype for the time being
	_deleteRow will be added later

	if _getSpecificData is declared from the component, _deleteRow should be too as they will share the _limit and _limitTweaked value between themselves in a common scope
*/

/* 
 *	required keys in 'data' parameter of listComponentPrototype function	
 *
	tagName -> like FloorList, PropertyList etc.
	aTableState -> additional state apart from basicTableState that influences Table Component
	a_key_stateKey -> additional state apart from basic_key_stateKey that adds to 'key to statekey' mapping object
	aStateObj -> additional state object key-value pairs to add to components state, only while in constructor
	getModifiedTableData
	_getSpecificData
	_getSpecificDataParams -> to capture information like starting loader title, ending loader title etc.
	ServerAPIFnName
	moduleColumns
	tableColumns
	sortingColumns
	filterItemArr
	queryIndex -> index where queries are placed in the location.hash after splitting them by '/'
	masterModule
	getDeleteMsg


*/

var listComponentPrototype = function (data) {
	var tagName = data.tagName;

	var sortingColumns = data.sortingColumns;
	var tableColumns = data.tableColumns;

	var key_stateKey = Object.assign({}, basic_key_stateKey, data.a_key_stateKey || null);
	var defaultTableState = Object.assign({filterItem: sortingColumns[1]}, basicTableState, data.aTableState || null);
	var tableStateKeys = Object.keys(defaultTableState);
	var defaultKeyValuePair = Object.keys(key_stateKey).map(function (key) {return key + "=" + defaultTableState[key_stateKey[key]];});
	
	var stateObj = Object.assign({}, basicStateObj, data.aStateObj);
	this.state = stateObj;

	this.denyUpdate = false;

	var moduleColumns = data.moduleColumns;
	var getModifiedTableData = data.getModifiedTableData;
	var _getSpecificDataParams = data._getSpecificDataParams || {};
	var ServerAPIFnName = data.ServerAPIFnName;
	this._getSpecificData = this._getSpecificData || function (_data) {
		var self = this;
		var stateObj = this.state;

		if (stateObj.loaderState == 'loading') {
			if (!this.__forceRetrieve) {
				manualAlert('<div style="white-space:pre;">Please wait while it completes loading current request!\nOr, click on the respective close icon to abort the loader.', "Information", {alertPosition: 'rightTop'}); // Should be replaced by a better notifier!
				return;
			} else {
				this.__forceRetrieve = false;
			}
		}
		
		this.__prelFetchAttempted = true;

		_data = _data || {};
		var pageNumber = _data.pageNumber || stateObj.pageNumber;
		var skip = (pageNumber - 1) * _limit;
		var sortingIndex = parseInt(_data.sortingIndex || stateObj.sortingIndex);
		var sortingOrder = parseInt(typeof _data.sortingOrder != 'undefined' ? _data.sortingOrder : stateObj.sortingOrder);
		var filterValue = typeof _data.filterValue != 'undefined' ? _data.filterValue : stateObj.filterValue;
		var filterItem = stateObj.filterItem;
		var whereQuery = null;

		var skipLoader = _data.skipLoader ? true : false; 
		_limitTweaked = _limit;

		var preStateSetter = {
			pageNumber: pageNumber,
			sortingIndex: sortingIndex,
			sortingOrder: sortingOrder,
			filterValue: filterValue
		};

		if (!skipLoader) {
			preStateSetter.loaderState = 'loading';
			preStateSetter.loaderTitle = _getSpecificDataParams.sLoaderTitle || 'Loading Data!';
		}

		this.setState(preStateSetter);

		var _getData = function () {
			var queryData = {
				skip: skip,
				limit: _limit,
				select: ['Did'].concat(moduleColumns) 
			}

			if (whereQuery) {
				queryData.where = whereQuery;
			}

			if (sortingOrder) {
				if (sortingIndex > 0) {
					queryData.orderBy = {
						[sortingColumns[sortingIndex]]: sortingOrder
					}
				}
			}

			ServerAPI[ServerAPIFnName](queryData, function (res) {
				var processedData = getModifiedTableData.call(self, res.Data);
				var partialTableData = processedData.data;
				var tableData = self.state.tableData;
				partialTableData.map(function (item, index) {
					tableData[skip + index] = item;
				})

				self.setState({
					loaderState: 'done',
					loaderTitle: _getSpecificDataParams.eLoaderTitle || "Data Loaded!",
					tableData: tableData
				}, function () {
					self.refs['table'].update({data: tableData});
				})
			});
		}

		var _count = function () {
			var queryData = {count: true};
			if (whereQuery) {
				queryData.where = whereQuery;
			}
			ServerAPI[ServerAPIFnName](queryData, function (res) {
				if (res.Status != 'Success') {
					// Error Handler!
					return;
				}

				var tableDataLen = parseInt(res.Data);
				var stateSetter = {tableData: new Array(tableDataLen)};
				if (tableDataLen <= skip) {
					skip = 0;
					stateSetter.pageNumber = 1;
				}
				self.setState(stateSetter, _getData);
			})
		}

		if (filterValue) {
			if (!skipLoader) {
				self.setState({
					loaderState: 'loading',
					loaderTitle: 'Filtering Data'
				})
			}
		
			whereQuery = {
				[filterItem]: {
					$regex:	filterValue,
					$options: 'i'
				}
			};
			_count();
		} else {
			_count();
		}
	}.bind(this);

	var queryIndex = data.queryIndex || 2;
	this.__rootRoute = this.__rootRoute || commonFunctions.getRoute(queryIndex);

	this.getQueryRelatedObj = this.getQueryRelatedObj || function () {
		var self = this;

		var stateSetter = {};
		var locationSearchArr = location.hash.split('/');

		var query = locationSearchArr[queryIndex];
		if (query) {
			if (query == "0") {
				if (locationSearchArr.length == queryIndex + 1) {
					history.replaceState(history.state, "", this.__rootRoute);
					// Note - make the upper state replacer more dynamic using a function
				}

			} else {
				var keyValuePair = query.split("&");
				keyValuePair.map(function (item) {
					var splitVal = item.split('=');
					var key = splitVal[0];
					var value = splitVal[1];
					var stateKey = key_stateKey[key];
					stateSetter[stateKey] = value;
				})
			}
		}

		var selectedPageCommand = locationSearchArr[queryIndex + 1];
		var selectedPage = null;
		if (selectedPageCommand) {
			selectedPage = selectedPageCommand.split("_")[1] || null;
		}

		if (selectedPage != this.state.selectedPage) {
			Object.assign(stateSetter, {selectedPage: selectedPage, showModalData: selectedPage ? true : false, modalView: selectedPage ? true : false});
		}

		// queryNew is polluting the stateObj -> resolve that
		if (locationSearchArr[queryIndex + 2]) {
			var queryObj = {queryDid: null};
			locationSearchArr[queryIndex + 2].split("&").map(function (item) {
				var splittedItem = item.split("=");
				queryObj["query" + splittedItem[0]] = splittedItem[1];
			})
			stateSetter = Object.assign(stateSetter, queryObj);
		} else {
			if (this.state.queryDid !== null) {
				stateSetter.queryDid = null;
			} 
		}

		return stateSetter;
	}
	this.getQueryRelatedObj = this.getQueryRelatedObj.bind(this);


	this.shouldComponentUpdate = function () {
		if (this.denyUpdate) {
			this.denyUpdate = false;
			return false;
		} else {
			return true;
		}
	}.bind(this);

	this.componentWillReceiveProps = this.componentWillReceiveProps || function () {
		var stateObj = this.state;
		var newState = this.getQueryRelatedObj();

		Object.keys(defaultTableState).map(function (key) {
			if (key in newState) {
				if (stateObj[key] == newState[key]) delete newState[key];
			} else {
				if (stateObj[key] != defaultTableState[key]) newState[key] = defaultTableState[key];
			}
		})

		if ('filterValue' in newState) newState['_filterValue'] = newState['filterValue'];
		if ('filterItem' in newState) newState['_filterItem'] = newState['filterItem'];

		if (Object.keys(newState).length) {
			//var selectedPage = 'selectedPage' in newState ? newState.selectedPage : stateObj.selectedPage;
			var callBack = Object.keys(defaultTableState).find(function (key) {
				// Maybe instead of here, we can determine the callBack while processing the previous mapping
				if (key in newState) {
					if (key == "filterItem") return stateObj['filterValue'] ? true : false;
					return stateObj[key] != newState[key];
				}
				return false;
			}) ? this._getSpecificData : null;
			this.setState(newState, callBack);
		} else this.denyUpdate = true;
	}.bind(this)

	this._manipulateTable = function (item) {
		var Did = item.Did;
		window.navigate(this.__rootRoute + this.buildQuery() + "/Modify_" + tagName + (Did ? "/Did=" + Did : ""));
	}.bind(this);

	var masterModule = data.masterModule;
	var getDeleteMsg = data.getDeleteMsg;
	if (getDeleteMsg) getDeleteMsg = getDeleteMsg.bind(this);
	else getDeleteMsg = function () {return "Are you sure you want to delete this item?";}  
	this._deleteRow = this._deleteRow || function (item) {
		var self = this;
		var alertData = {
			type: 'warning',
			isConfirmed: function () {
				var queryData = {
					moduleName: masterModule,
					rowDid: item.Did,
					type: 'delete'
				}

				var tableData = self.state.tableData;
				var deleteIndex = tableData.findIndex(function (tableItem) {
					return tableItem[0].item === item;
				})
				var deletedArr = tableData.splice(deleteIndex, 1);
				self.refs['table'].update({data: tableData, tableLength: --_limitTweaked});

				ServerAPI.modifyModuleData(queryData, function (res) {
					if (res.Status == 'Success') {

					} else {
						manualAlert('Failed to delete data!', 'Failure', {type: 'warning'});
						tableData.splice(deleteIndex, 0, deletedArr[0]);
						self.refs['table'].update({data: tableData, tableLength: _limit});
					}
				})
			}
		}

		manualAlert(getDeleteMsg(item), "Reconfirmation", alertData);
	}
	this._deleteRow = this._deleteRow.bind(this);


	this.buildQuery = function (newState) {
		var stateObj = this.state;
		var tableParamObj = {};
		tableStateKeys.map(function (key) {tableParamObj[key] = stateObj[key];});
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
	}.bind(this);


	this._onTableParamChange = function (key, value, e) {
		var newState = null;
		if (key == "pageNumber") {
			newState = {pageNumber: value};
		} else if (key.search('sortingOrder') == 0) {
			newState = {sortingOrder: value};
		} else if (key.search('sortingIndex') == 0) {
			newState = {sortingIndex: value, sortingOrder: -1};
		}
		if (newState) window.navigate(this.__rootRoute + this.buildQuery(newState));
	}.bind(this);


	this._showModal = function () {
		window.navigate(this.__rootRoute + this.buildQuery() + "/Modify_" + tagName + "/New");
	}.bind(this);

	this._hideModal = function () {
		if (!this.__prelFetchAttempted) {
			// Since no previous fetch has been recorded for that component, 
			// a function is trigerred to load data for the first time
			// and after the routing occurs due to the last function execution of this scope
			// data is requested to load again, while the data is being already loaded (assuming previous request has been processed within such short time (1-10 ms))
			// since stateObj.loaderState == 'loading' halts simultaneous request in _getSpecificData
			// that simultaneous second request doesnt get through
			this._getSpecificData();
		}

		window.navigate(this.__rootRoute + this.buildQuery());
	}.bind(this)

	this.componentDidMount = this.componentDidMount || function () {
		if (!this.state.selectedPage) {
			if (!this.props.callBack('all', this._getSpecificData)) { 
				this._getSpecificData();
			}
		}
	}.bind(this);

	this._onValueChange = function (e) {
		var self = this;
		var stateObj = this.state;
		var targetObj = e.target;
		var key = targetObj.name;

		var token = Math.random();
		var value = targetObj.value;
		this._changeToken = token;

		var delay = key == "_filterItem" ? 20 : value == "" ? 200 : 1200;
		var stateSetter = {
			[key]: value
		};

		setTimeout(function () {
			if (token == self._changeToken) {
				window.navigate(self.__rootRoute + self.buildQuery({[key.substr(1)]: value}));
			}
		}, delay);

		this.setState(stateSetter);
	}.bind(this);

	this._handleKeyPress = function (e) {
		if (e.key == "Enter") {

		}
 	}.bind(this);

 	Object.assign(stateObj, defaultTableState, this.getQueryRelatedObj());
	stateObj._filterValue = stateObj.filterValue;
	stateObj._filterItem = stateObj.filterItem;

	var componentProto = this.__componentProto = {};

	componentProto.getElementRightHeading = function (stateObj) {
		var loaderState = stateObj.loaderState;
		return (
			<div 
				title="Refresh Notification" 
				className={"btn fa fa-refresh pointer text-success" + (loaderState == "loading" ? " fa-spin" : "")} 
				style={{marginTop: '7px', marginRight: '20px', color: 'white'}} 
				onClick={this._getSpecificData}></div>
		);
	}.bind(this);

	componentProto.getLoader = function (stateObj) {
		return (
			<div style={{height: stateObj.loaderState == "loading" ? "30px" : '0px', position: 'absolute', backgroundColor: '#64a5ab', left: '0px', color: 'white', top: '0px', width: '100%', borderRadius: '0px 0px 5px 5px', textAlign: 'center', overflow: 'hidden', transition: 'height .38s linear'}}>
				<span
					style={{
					    padding: '6px 12px',
					    lineHeight: '30px',
					    verticalAlign: 'middle',
					    fontWeight: 'bold',
					    fontSize: '12px'
					}}>
					<i className="fa fa-cog fa-spin" style={{margin: '0px 4px'}}></i>
					{stateObj.loaderTitle}
					<i onClick={this.setState.bind(this, {loaderState: 'done'})} className="fa fa-close" style={{marginRight: '15px', float: 'right', verticalAlign: 'middle', lineHeight: '28px', cursor: 'pointer'}}></i>
				</span>
			</div>
		);
	}.bind(this);

	componentProto.getModal = function (stateObj) {
		return (
			<Modal open={stateObj.modalView} onHideRequest={this._hideModal} style={{width: '940px'}}>
				{stateObj.showModalData ? 
					<ModifyItem 
						/*items={[{
							label: 'Add Property',
							value: 'Property',
							href: this.__rootRoute + this.buildQuery() + '/Modify_' + tagName + '/New'
						}]}*/
						selectedPage={stateObj.selectedPage}
						//rootHref={this.__rootRoute + this.buildQuery() + '/Modify_' + tagName}
						Did={stateObj.queryDid}
						/> 
					: null
				}
			</Modal>
		);
	}.bind(this);


	componentProto.getAddButton = function (stateObj, balloon) {
		return (
			<div style={{lineHeight: '34px', height: '34px', float: 'left', paddingLeft: '15px'}}>
                <div 	
                	onClick={this._showModal} 
                    data-balloon={balloon || "Add New Item"}
                    data-balloon-pos="right"
                	style={{cursor: 'pointer', padding: '0px 9px', backgroundColor: '#38bc38', borderBottom: '2px solid green', borderRadius: '4px', marginTop: '6px', height: '28px', lineHeight: '28px'}}>
                    <i className="fa fa-plus" style={{color: 'white', verticalAlign: 'middle', fontSize: '1.3em'}}></i>
                </div>
            </div>
		);
	}.bind(this);

	componentProto.getFilterElements = function (stateObj, filterOption, preElem, postElem) {
		return (
			<div className="row" style={{textAlign: 'center', margin: '12px 0px 24px'}}>
				<div style={{display: 'table', position: 'relative', margin: 'auto', position: 'relative'}}>
					{stateObj.childViewMode ?
						<div style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(231, 217, 217, 0.1)', zIndex: 2}}>

						</div> : null
					}
					
					{preElem || null}
					
					{filterOption ?
						<div style={{display: 'inline-block', margin: '5px 0px'}}>
							<select value={stateObj._filterItem} className="form-control" style={{/*width: '120px',*/ borderRadius: '3px 3px 0px 3px'}} name="_filterItem" onChange={this._onValueChange}>
								{filterOption.map(function (item) {
									return (
										<option value={item[1] || item[0]} key={item[0]}>{item[0]}</option>
									);
								})}
							</select>
						</div> : null}

					{filterOption ?
						<div style={{display: 'inline-block', position: 'relative', minWidth: '300px', height: '28px', margin: '5px 0px'}}>
							<div style={{position: 'absolute', bottom: '0px', height: '1px', backgroundColor: '#ccc', width: '100%'}}>

							</div>
							<input placeholder="Search" name="_filterValue" value={stateObj._filterValue} onKeyPress={this._handleKeyPress} onChange={this._onValueChange} style={{padding: '1px 20px', border: 'none', width: '100%', outline: 'none', backgroundColor: 'transparent'}}/>
							{stateObj._filterValue ?
								<div style={{position: 'absolute', right: '5px', top: '0px'}}>
									<i className="fa fa-times" style={{color: 'steelblue', cursor: 'pointer'}} onClick={this._onValueChange.bind(this, {target: {name: '_filterValue', value: ''}})}></i>
								</div> : null
							}
						</div> : null}

					{postElem || null}

				</div>
			</div>
		);
	}.bind(this);

	componentProto.getTable = function (stateObj) {
		var self = this;
		return (
			<ReactStickyTable
				ref="table"
				stickyRows={1}
				columns={tableColumns}
				data={stateObj.tableData}
				sortingIndex={stateObj.sortingIndex}
				sortingOrder={stateObj.sortingOrder}
				pageNumber={stateObj.pageNumber}
				tableLength={_limit}
				tableContainerMaxHeight={350}
				settings={{
					search: false,
					tableLength: false,
					pagination: true,
					information: true
				}}
				onChange={this._onTableParamChange}
				childRowEnabled={true}
				controlledDataUpdate
				disableSorting
				onHideChildRequest={function () {
					self.setState({
						childViewMode: false
					})
				}}
				onExpandChildRequest={function () {
					self.setState({
						childViewMode: true
					})
				}}

				/>
		);
	}.bind(this);
}

export default listComponentPrototype;