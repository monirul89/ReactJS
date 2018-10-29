var React = require('react');

var Mui = require('material-ui');
var SelectField = Mui.SelectField;
var MenuItem = Mui.MenuItem;
var TextField = Mui.TextField;
var DatePicker = Mui.DatePicker;
var Checkbox = Mui.Checkbox;
var RaisedButton = Mui.RaisedButton;

var FontIcon = Mui.FontIcon;
var NavigateNextIcon = React.createClass({
	render: function () {
		return (
			<FontIcon className='material-icons' style={this.props.style || null} color={this.props.color || null}>chevron_right</FontIcon>
		)
	}
})

var BackUpIcon = React.createClass({
	render: function () {
		return (
			<FontIcon className='material-icons' style={this.props.style || null} color={this.props.color || null}>backup</FontIcon>
		)
	}
})

var ArrowDropRight = React.createClass({
	render: function () {
		return (
			<FontIcon className='material-icons' style={this.props.style || null} color={this.props.color || null}>arrow_forward</FontIcon>
		)
	}
})

var ClearIcon = React.createClass({
	render: function () {
		return (
			<FontIcon className='material-icons' style={this.props.style || null} color={this.props.color || null}>clear</FontIcon>
		)
	}
})

var PremisePanel = require('./General/PremisePanel');
var TopLoader = require('./General/TopLoader');
var ReactStickyTable = require('./General/react-sticky-table');

var commonFunctions = require('./Utils/commonFunctions');
var ServerAPI = require('./Utils/ServerAPI');
var docCookies = require('./Utils/docCookies');

var __sp__ = require('smoothscroll-polyfill');
__sp__.polyfill();

var keyValuePair = {};

var location = window.location;

var getParams = location.search.substr(1);
getParams.split('&').map(function (item) {
    var splitterIndex = item.indexOf('='); 
    keyValuePair[item.substr(0, splitterIndex)] = item.substr(splitterIndex + 1);
});

var _cookieToken = docCookies.getItem('Token');
if (_cookieToken) {
    _cookieToken = JSON.parse(_cookieToken)[0];
    if (!keyValuePair.AppKey && _cookieToken.Appkey) keyValuePair.AppKey = _cookieToken.Appkey.replace(/@/g, "=");
    if (!keyValuePair.Key && _cookieToken.Key) keyValuePair.Key = _cookieToken.Key.replace(/@/g, "=");
    //if (!keyValuePair.Key && _cookieToken.Key) keyValuePair.Key = _cookieToken.Key.replace(/@/g, "=");
}

var cookieData = keyValuePair;

ServerAPI.setVariables(cookieData);

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(function (item, index) {
	return {label: item, value: index + 1};
})

var years = [];
for (var i = 2016; i < (new Date()).getFullYear() + 1; i++) years.push(i);
// How should we generalize fetching years?

var quarters = ['Q1', 'Q2', 'Q3', 'Q4'].map(function (item, index) {
	return {label: item, value: item};
})

/*var extractDateTime = function (str) {
	var splittedDateVars = str.split(/-| |:/);
	if (splittedDateVars[6] == "PM") splittedDateVars[3] = parseInt(splittedDateVars[3]) + 12;
	var dateNumber = Date.UTC(splittedDateVars[0], parseInt(splittedDateVars[1]) - 1, splittedDateVars[2], splittedDateVars[3], splittedDateVars[4], splittedDateVars[5]);
	return dateNumber;
	//var dateObj = (new Date(dateNumber));
	//var insertedDateLocaleString = dateObj.toLocaleString(true, {month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'long', weekday: 'long'});
	//var dateCreated = dateObj.toLocaleString(true, {month: 'long', day: 'numeric', year: 'numeric'});
}*/

var extractDateStr = function (dateTime) {
	var date = new Date(dateTime);
	var res = date.getDate().toString();
	if (res.length < 2) res = '0' + res;

	res = (date.getMonth() + 1) + res;
	if (res.length < 4) res = '0' + res;

	return date.getFullYear() + res;
}

var selectDefaultStyle = {
	width: '400px',
	margin: 'auto',
	display: 'block',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	maxWidth: '100%',
	position: 'relative'
}

var Report = React.createClass({
	getInitialState: function () {
		var props = this.props;
		this.shouldComponentUpdate = commonFunctions.defaultShouldComponentUpdate;
		this.getLoaderArr = commonFunctions.getLoaderArr.bind(this);

		/*this._onTableParamChange = this._onTableParamChange.bind(this);
		this._onReportNameChange = this._onReportNameChange.bind(this);
		this._onSelectFieldChange = this._onSelectFieldChange.bind(this);
		this._onTextFieldChange = this._onTextFieldChange.bind(this);
		this._saveReport = this._saveReport.bind(this);
		this._loadSpecificReport = this._loadSpecificReport.bind(this);
		this._loadReportStructureNames = this._loadReportStructureNames.bind(this);
		this._getData = this._getData.bind(this);
		this._getDataMod = this._getDataMod.bind(this);
		this.loadAjaxFields = this.loadAjaxFields.bind(this);
		this.initializeReportKeys = this.initializeReportKeys.bind(this);*/

		ServerAPI.setVariables({Host: props.NoSQL});

		return {
			reports: [],
			selectedReport: null,
			reportDid: "",
			reportInfo: [],
			filterValues: {},
			excludedFields: {},
			ajaxFieldValues: {},
			dateTypeFieldValues: {},
			cascadeFields: {},
			shareWithValues: {},
			tableData: null,
			tableDataLoaded: false,
			loaderArr: [{state: 'transit', title: 'Component rendering in progress!'}],
			customReportName: '',
			structureName: '',
			loadingReports: false,
			loadedStructures: [],
			pageNumber: 1,
			sortingOrder: 0,
			sortingIndex: -1
		}

		
	},

	_onTableParamChange: function (key, value, e) {
		/*var newState = null;
		if (key == "pageNumber") {
			newState = {pageNumber: value};
		} else if (key.search('sortingOrder') == 0) {
			newState = {sortingOrder: value};
		} else if (key.search('sortingIndex') == 0) {
			newState = {sortingIndex: value, sortingOrder: -1};
		}
		if (newState) window.navigate(this.__rootRoute + this.buildQuery(newState));*/

		var newState = null;
		var skip = (this.state.pageNumber - 1) * 10;
		if (key == "pageNumber") {
			newState = {pageNumber: value};
			skip = (value - 1) * 10;
		} else if (key.search('sortingOrder') == 0) {
			newState = {sortingOrder: value};
		} else if (key.search('sortingIndex') == 0) {
			newState = {sortingIndex: value, sortingOrder: -1};
		}

		if (newState) this.setState(newState, this._getData.bind(this, {skip: skip, limit: 10}))
	},

	componentDidMount: function () {
		var self = this;
		var props = this.props;

        // Lets make another way for receiving the application name instead of url

        var applicationName = props.application;
		var reportName = props.name;

		if (applicationName) {
			var queryData = {
				moduleName: 'ReportList',
				where: {
					ApplicationName: {
						$regex: applicationName
					},
					Published: 'true'
					//Name: reportName
				},
				select: ['Did', 'UserId', 'ModuleName', 'Published', 'Name'],
				optimize: true
			}

			/* ***CEA purpose */

			if (reportName) {
				queryData.where.Name = reportName;
			}

			/* ***CEA purpose (Enclosed) */


			self.setState(Object.assign({
        		loaderArr: self.getLoaderArr({
        			state: 'loading',
        			title: 'Loading Applicable Reports',
        			id: 'loadApplicableReports'
        		})
        	}, this.initializeReportKeys()))

			ServerAPI.aggregate(queryData, function (res) {
				self.setState({
        			loaderArr: self.getLoaderArr({
        				id: 'loadApplicableReports'
        			}, 'delete'),
        			reports: res.Data,
        			selectedReport: null
        		}, function () {
					/* ***CEA purpose */

					if (!res.Data.length) {
						alert('Unable to progress!');
						console.error('No such report with the name - "' + reportName + '"');
						return;
					}

					this._onReportNameChange({}, 0, res.Data[0]);

					/* ***CEA purpose (Enclosed) */
        		})
			})
		}

	},

	_onReportNameChange: function (e, index, value) {
		var self = this;
		var props = this.props;
		this.setState({
			selectedReport: value,
			//loadedStructures: [],
			//structureName: ''
		}, value ? function () {
			var MID = value.Did;
			var queryData = {
				moduleName: 'ReportListDetails_Settings',
				where: {
					MID: MID
				},
				select: ['Did', 'Fetch', 'FieldName', 'Name', 'Hide', 'Searchable', 'DefaultList', 'CascadeField', 'ShareWith'],
				optimize: true
			}

			self.setState(Object.assign({
        		loaderArr: self.getLoaderArr({
        			state: 'loading',
        			title: 'Loading Report Basics!',
        			id: 'loadReportBasics'
        		}),
        		structureName: ""
        	}, self.initializeReportKeys()));

        	ServerAPI.aggregate(queryData, function (res) {
        		var reportInfo = res.Data;

        		var queryData_2 = {
        			moduleName: 'ReportListDetails_Structure',
        			where: {
        				MID: MID
        			},
        			select: ['Field', 'Type', 'Module', 'ShowAs'],
        			optimize: true
        		}

        		ServerAPI.aggregate(queryData_2, function (res_2) {
        			res_2.Data.map(function (item) {
        				reportInfo.find(function (i) {
        					var fieldName = item.ShowAs || (item.Module + "." + item.Field);
        					if (i.FieldName == fieldName) {
        						i.Type = item.Type;

        						if (item.Type == 'date') {
	        						self.state.dateTypeFieldValues[fieldName] = {
	        							year: "",
	        							month: "",
	        							quarter: "",
	        							dateType: ""
	        						}
	        					}
        						return true;
        					} else return false;
        				})
        			})

        			/* ***CEA purpose */

        			var _callBack = props.name ? self.loadAjaxFields.bind(self, self._getData.bind(self, {limit: 10})) : self.loadAjaxFields;
					
					/* ***CEA purpose (Enclosed) */

					self.setState({
	        			loaderArr: self.getLoaderArr({
	        				id: 'loadReportBasics'
	        			}, 'delete'),
	        			reportInfo: reportInfo 
	        		}, _callBack)
        		})

			})
		} : null)
	},

	_onSelectFieldChange: function (key, e, index, value) {
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

		var callBack = null;
		var cascadeField = this.state.cascadeFields[key];
		if (cascadeField) {
			if (val) callBack = this.getCascadedFieldValues(cascadeField, key, val);
			else {
				this.state.filterValues[cascadeField] = [];
				this.state.ajaxFieldValues[cascadeField] = [];
			}
		}

		if (typeof key == 'object') {
			key.item[key.key] = val;
			this.forceUpdate(callBack);
		} else {
			var filterValues = this.state.filterValues;
			filterValues[key] = val;
			this.setState({filterValues: filterValues}, callBack);
		}
	},

	_onTextFieldChange: function (key, e, val) {
		var filterValues = this.state.filterValues;
		filterValues[key] = val;
		this.setState({filterValues: filterValues});
	},

	_saveReport: function () {
		var self = this;
		var stateObj = this.state;

		var StructureName = stateObj.structureName;
		if (!StructureName) {
			alert('Please select a name for the Structure!');
			return;
		}

		var filterData = {
			filterValues: stateObj.filterValues,
			dateTypeFieldValues: stateObj.dateTypeFieldValues,
			excludedFields: stateObj.excludedFields,
			shareWithValues: stateObj.shareWithValues
		}

		var ReportName = stateObj.selectedReport.Name;
		var MID = stateObj.selectedReport.Did;

		var data = {
			Data: escape(JSON.stringify(filterData)),
			ReportName: ReportName,
			StructureName: stateObj.structureName,
			MID: stateObj.selectedReport.Did,
		}

		this.setState({
			loaderArr: this.getLoaderArr({
				id: 'saveReportStructure',
				title: 'Saving Report Structure!',
				state: 'loading' 
			})
		})

		var prevItem = stateObj.loadedStructures.find((i) => i.MID == MID);

		ServerAPI.saveReportStructure(data, function (res) {
			var newState = {
				loaderArr: self.getLoaderArr({
					id: 'saveReportStructure'
				}, 'delete')
			}

			if (prevItem && ReportName == self.state.selectedReport.Name) {
				var loadedStructures = self.state.loadedStructures;
				prevItem.Did = res.Data;
				newState.loadedStructures = loadedStructures;
			}
			self.setState(newState);
		})
	},

	_loadSpecificReport: function (Did) {
		var self = this;
		var stateObj = this.state;

		var ReportName = stateObj.selectedReport.Name;

		this.setState({
			loaderArr: this.getLoaderArr({
				id: 'getSpecificReport',
				// Should i add Did to it too? Maybe later!
				title: 'Loading Report Structure Data!',
				state: 'loading'
			})
		})

		ServerAPI.loadReportStructure(Did, function (res) {
			// Dont load the structure if user has changed the report type
			var newState = {
				loaderArr: self.getLoaderArr({
					id: 'getSpecificReport'
				}, 'delete')
			}

			if (self.state.selectedReport.Name == ReportName) {
				newState.structureName = res.Data[0].StructureName;
				Object.assign(newState, JSON.parse(unescape(res.Data[0].Data)));
			}

			self.setState(newState);
		})
	},

	_loadReportStructureNames: function () {
		var self = this;
		var stateObj = this.state;

		var selectedReport = stateObj.selectedReport;
		var ReportName = selectedReport.Name;

		var data = {
			ReportName: ReportName,
			MID: selectedReport.Did
		}

		this.setState({
			loaderArr: this.getLoaderArr({
				id: 'getReportStructureNames',
				title: 'Loading Saved Reports!',
				state: 'loading'
			}),
			loadingReports: true
		})

		ServerAPI.loadReportStructure(data, function (res) {
			var newState = {
				loaderArr: self.getLoaderArr({
					id: 'getReportStructureNames'
				}, 'delete'),
				loadingReports: false
			};

			if (self.state.selectedReport.Name == ReportName) {
				newState.loadedStructures = res.Data;
			}

			self.setState(newState);
		})
	},

	_getDataMod: function (queryDataExt) {
		var self = this;
		var stateObj = this.state;
		var stickyTableData = [];
  		self.refs['container'].scrollIntoView({behavior: 'smooth'});

  		var selectedReport = stateObj.selectedReport;

		var scopeRes = null;

		var whereObj = {};
		var headers = [];
		var selectObj = [];

		var skip = queryDataExt.skip || 0;
		var sortingOrder = stateObj.sortingOrder;
		var sortingIndex = stateObj.sortingIndex;

		var moduleName = selectedReport.ModuleName;
		stateObj.reportInfo.map(function (i) {
			if (i.Hide != '1') {
				if (stateObj.excludedFields[i.FieldName] !== true) {
					selectObj.push(i.FieldName);
					headers.push({label: i.Name, value: i.FieldName});
				}
			}
		})

		Object.keys(stateObj.filterValues).map(function (key, index) {
			var value = stateObj.filterValues[key];
			if (Array.isArray(value)) {
				if (value.length) {
					if (value.length > 1) {
						whereObj[key] = {$in: value};
					} else if (value[0] != '__clear_all__') {
						whereObj[key] = value[0];	
					} 
				}
			} else if (value) {
				whereObj[key] = value;
			}
		})

		Object.keys(stateObj.dateTypeFieldValues).map(function (key, index) {

			var item = stateObj.dateTypeFieldValues[key];

			if (stateObj.reportInfo.find((i) => i.FieldName == key).DateRange === true) {
				if (item.dateFrom) {
					whereObj[key] = {
						$gte: extractDateStr(item.dateFrom)
					}
				}

				if (item.dateTo) {
					if (!(key in whereObj)) whereObj[key] = {};
					whereObj[key]["$lte"] = extractDateStr(item.dateTo);
				}
				return;
			}

			var dateTimeFilters = {month: [], year: [], quarter: []};

			['month', 'quarter', 'year'].map(function (i) {
				var filterValue = [].concat(item[i]);
				if (filterValue[0] == '__clear_all__') filterValue.pop();
				dateTimeFilters[i] = filterValue;
			})

			var month = "";
			var year = "";
			var dateType = item.dateType;

			if (dateType == 'Month') {
				var mArr = [];
				dateTimeFilters.month.map(function (m) {
					if (m < 10) m = '0' + m;
					mArr.push(m);
				})
				if (mArr.length) {
					month = "(" + mArr.join("|") + ")";
				}
			} else if (dateType == 'Quarter') {
				var qArr = [];
				dateTimeFilters.quarter.map(function (q) {
					if (q == 'Q1') q = "01|02|03";
					else if (q == "Q2") q = "04|05|06";
					else if (q == 'Q3') q = "07|18|09";
					else if (q == "Q4") q = "10|11|12";
					else {
						return;
					}
					qArr.push(q);
				})
				if (qArr.length) {
					month = "(" + qArr.join("|") + ")";
				}
			}

			if (dateType && dateType != '__clear_all__') {
				var yArr = [];
				dateTimeFilters.year.map(function (y) {
					if (y < 10) y = '0' + y;
					yArr.push(y);
				})
				if (yArr.length) {
					year = "(" + yArr.join("|") + ")";
				}
				whereObj[key] = {
					$regex: (year || '....') + (month || '..')
				}
			}
		});

		var postQueryFn = null;

		var queryData = {
			moduleName: moduleName,
			where: whereObj,
			select: selectObj,
			optimize: true
		}

		Object.assign(queryData, queryDataExt);

		self.setState({
			loaderArr: self.getLoaderArr([{
				state: 'loading',
				title: 'Retrieving Data!',
				id: 'retrieveData'
			}]),
			//tableData: null,
			//tableDataLoaded: false
		})

		var _getData = function () {

			if (sortingOrder) {
				if (sortingIndex > 0) {
					queryData.orderBy = {
						[headers[sortingIndex].value]: sortingOrder
					}
				}
			}

			ServerAPI.aggregate(queryData, function (res) {
				scopeRes = [];
				var tableData = null;
				if (res.Status == "Success") {
					scopeRes = res.Data;

					tableData = {
						data: scopeRes,
						headers: headers
					};

					var _headers = headers.map((i) => i.value);
					scopeRes.map(function (item, index) {
						var row = [];
						_headers.map(function (sItem, sIndex) {
							row.push({
								label: item[sItem]
							}) 
						})
						stickyTableData[skip + index] = row;
					})

					if (self.refs.table) {
						postQueryFn = self.refs['table'].update.bind(null, {
							data: stickyTableData,
							headers: headers.map((i) => ({label: i.label}))
						})
					}
				}

				self.setState({
					loaderArr: self.getLoaderArr({
						id: 'retrieveData'
					}, 'delete'),
					tableData: tableData,
					stickyTableData: stickyTableData,
					stickyTableHeaders: headers.map((i) => ({label: i.label})),
					//tableDataLoaded: postQueryFn ? false : true
					tableDataLoaded: true
				}, postQueryFn)
			})
		}

		var _getCount = function () {
			var queryData = {
				moduleName: moduleName,
				where: whereObj,
				count: true
			}

			ServerAPI.aggregate(queryData, function (res) {
				if (res.Status != 'Success') {
					// Error Handler!
					return;
				}

				var tableDataLen = parseInt(res.Data);
				stickyTableData = new Array(tableDataLen);
				/*if (tableDataLen <= skip) {
					skip = 0;
					stateSetter.pageNumber = 1;
				}*/


				self.setState({}, _getData);
			})

		}

		_getCount();

	},

	_getData: function (queryDataExt) {
		//queryDataExt = queryDataExt || {};
		if (queryDataExt) {
			this._getDataMod(queryDataExt);
			return;
		}
		var self = this;
		var stateObj = this.state;
  		self.refs['container'].scrollIntoView({behavior: 'smooth'});

  		var selectedReport = stateObj.selectedReport;

		var scopeRes = null;

		var whereObj = {};
		var headers = [];
		var selectObj = [];

		var moduleName = selectedReport.ModuleName;
		stateObj.reportInfo.map(function (i) {
			if (i.Hide != '1') {
				if (stateObj.excludedFields[i.FieldName] !== true) {
					selectObj.push(i.FieldName);
					headers.push({label: i.Name, value: i.FieldName});
				}
			}
		})

		Object.keys(stateObj.filterValues).map(function (key, index) {
			var value = stateObj.filterValues[key];
			if (Array.isArray(value)) {
				if (value.length) {
					if (value.length > 1) {
						whereObj[key] = {$in: value};
					} else if (value[0] != '__clear_all__') {
						whereObj[key] = value[0];	
					} 
				}
			} else if (value) {
				whereObj[key] = value;
			}
		})

		Object.keys(stateObj.dateTypeFieldValues).map(function (key, index) {

			var item = stateObj.dateTypeFieldValues[key];

			if (stateObj.reportInfo.find((i) => i.FieldName == key).DateRange === true) {
				if (item.dateFrom) {
					whereObj[key] = {
						$gte: extractDateStr(item.dateFrom)
					}
				}

				if (item.dateTo) {
					if (!(key in whereObj)) whereObj[key] = {};
					whereObj[key]["$lte"] = extractDateStr(item.dateTo);
				}
				return;
			}

			var dateTimeFilters = {month: [], year: [], quarter: []};

			['month', 'quarter', 'year'].map(function (i) {
				var filterValue = [].concat(item[i]);
				if (filterValue[0] == '__clear_all__') filterValue.pop();
				dateTimeFilters[i] = filterValue;
			})

			var month = "";
			var year = "";
			var dateType = item.dateType;

			if (dateType == 'Month') {
				var mArr = [];
				dateTimeFilters.month.map(function (m) {
					if (m < 10) m = '0' + m;
					mArr.push(m);
				})
				if (mArr.length) {
					month = "(" + mArr.join("|") + ")";
				}
			} else if (dateType == 'Quarter') {
				var qArr = [];
				dateTimeFilters.quarter.map(function (q) {
					if (q == 'Q1') q = "01|02|03";
					else if (q == "Q2") q = "04|05|06";
					else if (q == 'Q3') q = "07|18|09";
					else if (q == "Q4") q = "10|11|12";
					else {
						return;
					}
					qArr.push(q);
				})
				if (qArr.length) {
					month = "(" + qArr.join("|") + ")";
				}
			}

			if (dateType && dateType != '__clear_all__') {
				var yArr = [];
				dateTimeFilters.year.map(function (y) {
					if (y < 10) y = '0' + y;
					yArr.push(y);
				})
				if (yArr.length) {
					year = "(" + yArr.join("|") + ")";
				}
				whereObj[key] = {
					$regex: (year || '....') + (month || '..')
				}
			}
		});

		var postQueryFn = null;

		var queryData = {
			moduleName: moduleName,
			where: whereObj,
			select: selectObj,
			optimize: true
		}

		Object.assign(queryData, queryDataExt);

		self.setState({
			loaderArr: self.getLoaderArr([{
				state: 'loading',
				title: 'Retrieving Data!',
				id: 'retrieveData'
			}]),
			tableData: null,
			tableDataLoaded: false
		})

		ServerAPI.aggregate(queryData, function (res) {
			scopeRes = [];
			var tableData = null;
			if (res.Status == "Success") {
				scopeRes = res.Data;

				tableData = {
					data: scopeRes,
					headers: headers
				};

				var stickyTableData = [];
				var _headers = headers.map((i) => i.value);
				scopeRes.map(function (item, index) {
					var row = [];
					_headers.map(function (sItem, sIndex) {
						row.push({
							label: item[sItem]
						}) 
					})
					stickyTableData.push(row);
				})
				self.__temp = stickyTableData;
				self.__tempColumns = headers.map((i) => ({label: i.label}));
			}

			self.setState({
				loaderArr: self.getLoaderArr({
					id: 'retrieveData'
				}, 'delete'),
				tableData: tableData,
				tableDataLoaded: postQueryFn ? false : true
			}, postQueryFn)
		})
	},

	loadAjaxFields: function (callBack) {
		var self = this;
		var stateObj = this.state;
		var props = this.props;
		var moduleName = stateObj.selectedReport.ModuleName;
		var loadFields = [];
		var reportInfo = stateObj.reportInfo;

		/* ***CEA purpose */

		var filter = props.filter;
		if (!filter) {
			reportInfo = [];
		}


		/* ***CEA purpose (Enclosed) */

		reportInfo.map(function (item, index) {
			if (item.Searchable == '1') {
				if (item.DefaultList) {
					var defaultList = item.DefaultList.split(',');
					if (item.Type == 'date') {
						if (defaultList[0] == 'range') {
							item.DateRange = true;
							return;
						}

						var yearValues = [];
						var foundIndex = -1;
						defaultList.find(function (i, index) {
							if (i == '...') {
								foundIndex = index;
								return true;
							} else return false;
						});

						if (foundIndex > -1) {

							if (foundIndex == 0 && defaultList[1]) {

								var curYear = (new Date()).getFullYear();
								var till = parseInt(defaultList[1]);
								while (curYear++ < till) yearValues.push(curYear - 1);
								defaultList.shift();
								yearValues = yearValues.concat(defaultList); 

							} else if (foundIndex == defaultList.length - 1) {

								var lastYear = parseInt(defaultList[defaultList.length - 2]);
								var till = (new Date()).getFullYear();
								while (lastYear++ < till) yearValues.push(lastYear);
								defaultList.pop();
								yearValues = defaultList.concat(yearValues);

							} else {

								for (var parser = 0; parser < foundIndex; parser++) yearValues.push(defaultList[parser]);
								for (var parser = parseInt(yearValues[yearValues.length - 1]) + 1; parser < parseInt(defaultList[foundIndex + 1]) + 1; parser++) yearValues.push(parser);
							
							} 

						} else yearValues = defaultList;

						stateObj.dateTypeFieldValues[item.FieldName].yearValues = yearValues;
					} else {
						stateObj.ajaxFieldValues[item.FieldName] = defaultList;
					}
				} else if (item.CascadeField) {
					stateObj.cascadeFields[item.CascadeField] = item.FieldName;
				} else if (item.Fetch == '1') {
					loadFields.push(item);
				}
			}
		})

		var parsed = -1, len = loadFields.length;

		var getValues = function () {
			parsed++;
			if (parsed == len) {
				if (callBack) callBack();
				return;
			}

			if (moduleName != (self.state.selectedReport || {}).ModuleName) {
				return;
			}

			var field = loadFields[parsed].FieldName;

			var queryData = {
				moduleName: moduleName,
				group: {
					_id: '$' + field,
					"0": {$first: '$' + field}
				}
			}

			self.setState({
				loaderArr: self.getLoaderArr({
	  				state: 'loading',
	  				title: 'Loading "' + loadFields[parsed].Name  + '" Values!',
	  				id: 'loadAjaxFields' + '-' + field
	  			})
			})

			ServerAPI.aggregate(queryData, function (res) {
				var newState = {
					loaderArr: self.getLoaderArr({
		  				id: 'loadAjaxFields' + '-' + field
		  			}, 'delete')
				}

				var postStateFn = null;

				if (res.Status != 'Success') {
					alert('Request failed!');
				} else {
					self.state.ajaxFieldValues[loadFields[parsed].FieldName] = JSON.parse(res.Data).map((i) => i['0']);
					postStateFn = getValues;
				}

				self.setState(newState, postStateFn);

			})
		}

		getValues();
	},

	getCascadedFieldValues: function (field, cascader, cascaderValue) {
		var self = this;
		var stateObj = this.state;
		var moduleName = stateObj.selectedReport.ModuleName;

		var queryData = {
			moduleName: moduleName,
			where: {
				[cascader]: cascaderValue
			},
			group: {
				_id: '$' + field,
				"0": {$first: '$' + field}
			}
		}

		self.setState({
			loaderArr: self.getLoaderArr({
  				state: 'loading',
  				title: 'Loading "' + field  + '" Values!',
  				id: 'loadCascadedFieldValues' + '-' + field
  			})
		})

		ServerAPI.aggregate(queryData, function (res) {
			var newState = {
				loaderArr: self.getLoaderArr({
	  				id: 'loadCascadedFieldValues' + '-' + field
	  			}, 'delete')
			}

			if (res.Status != 'Success') {
				alert('Request failed!');
			} else {
				self.state.ajaxFieldValues[field] = JSON.parse(res.Data).map((i) => i['0']);
			}

			self.setState(newState);

		})
	},

	render_dateTypeFilter: function (item) {
		var self = this;
		var stateObj = this.state;

		var type = item.dateType;
		var yearValues = item.yearValues || years;

		if (type == "Month") {
			return (
				<div style={{position: 'relative'}}>
					
					<SelectField
			        	floatingLabelText="Month"
			          	value={item.month}
			          	onChange={this._onSelectFieldChange.bind(this, {key: 'month', item: item})}
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
			          	value={item.year}
			          	onChange={this._onSelectFieldChange.bind(this, {key: 'year', item: item})}
			          	style={selectDefaultStyle}
			          	multiple
		          		selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
			        >
			        	<MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
			        	{yearValues.map(function (item, index) {
			        		return (
			        			<MenuItem key={index} value={item} primaryText={item} />
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
			          	value={item.quarter}
			          	onChange={this._onSelectFieldChange.bind(this, {key: 'quarter', item: item})}
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
			          	value={item.year}
			          	onChange={this._onSelectFieldChange.bind(this, {key: 'year', item: item})}
			          	style={selectDefaultStyle}
			          	multiple
		          		selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
			        >
			        	<MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
			        	{yearValues.map(function (item, index) {
			        		return (
			        			<MenuItem key={index} value={item} primaryText={item} />
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
			          	value={item.year}
			          	onChange={this._onSelectFieldChange.bind(this, {key: 'year', item: item})}
			          	style={selectDefaultStyle}
			          	multiple
		          		selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
			        >
			        	<MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
			        	{/*<MenuItem value={'__clear_all__'} primaryText={'Clear Item'} style={{color: 'white', backgroundColor: '#8b5656'}} />*/}
			        	{yearValues.map(function (item, index) {
			        		return (
			        			<MenuItem key={index} value={item} primaryText={item} />
			        		);
			        	})}
			        </SelectField>
				</div>
			);
		}
		return null;
	},

	initializeReportKeys: function () {
		return {
			filterValues: {},
    		excludedFields: {},
    		ajaxFieldValues: {},
    		dateTypeFieldValues: {},
    		cascadeFields: {},
    		shareWithValues: {},
    		loadedStructures: [],
    		reportInfo: []
		}
	},

	render: function () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;
		var reports = stateObj.reports;
		var selectedReport = stateObj.selectedReport || {};
		var reportInfo = stateObj.reportInfo;
		var filterValues = stateObj.filterValues;
		var excludedFields = stateObj.excludedFields;

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

		var mappedName = {};
		var shareWithShowed = {};
		var sharedFields = [];

		var getSelect_TextField = function (item) {
			if (!item) return null;
			return item.Fetch == '1' || item.DefaultList || item.CascadeField ? 
					<SelectField
			        	floatingLabelText={item.Name}
				      	value={filterValues[item.FieldName] || ""}
			          	onChange={self._onSelectFieldChange.bind(self, item.FieldName)}
				        style={selectDefaultStyle}
          				multiple={stateObj.cascadeFields[item.FieldName] ? false : true}
	          			selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
			        >
			        	<MenuItem value={'__clear_all__'} primaryText={stateObj.cascadeFields[item.FieldName] ? 'Clear Item' : 'All'} style={{color: 'white', backgroundColor: stateObj.cascadeFields[item.FieldName] ? '#8b5656' : '#4779ac'}} />

		        		{(stateObj.ajaxFieldValues[item.FieldName] || []).map(function (item, index) {
		        			return (
		        				<MenuItem key={item} value={item} primaryText={item}/>
		        			);
		        		})}
			        </SelectField> :
			        <TextField
				        style={selectDefaultStyle}
				      	floatingLabelText={item.Name}
				      	value={filterValues[item.FieldName] || ""}
				      	onChange={self._onTextFieldChange.bind(self, item.FieldName)}
				    />
		}

		/* ***CEA purpose */

		var reportName = props.name;
		var excFields = props.fieldExcludable ? true : false;
		var filter = props.filter ? true : false;
		if (reportName) {
			reports = [];
			if (!filter) {
				reportInfo.map(function (item, index) {
					item.Searchable = '0';
				})
			}
		}

		/* ***CEA purpose (Enclosed) */

		var tableData = stateObj.tableData;
		var headers = tableData && tableData.headers;
		var showTable = tableData && stateObj.tableDataLoaded;

		if (showTable) {

		}

		return (
			<div ref="container">
				<PremisePanel
					panelName="Report Portal"
					bodyStyle={{
						overflow: 'visible'
					}}
				>
					<TopLoader data={stateObj.loaderArr}/>

					{reports.length ?
						<div style={{display: 'table', margin: '0px auto 25px', position: 'relative'}}>
							<SelectField
					        	floatingLabelText="Report Name"
					          	value={stateObj.selectedReport}
					          	onChange={this._onReportNameChange}
					          	style={{
					          		width: '375px',
					          		//margin: '0px auto 25px',
					          		//display: 'table'
					          	}}
				          		selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
					        >
					        	{reports.map(function (item, index) {
					        		return (
					        			<MenuItem key={index} value={item} primaryText={item.Name} />
					        		);
					        	})}
					        </SelectField>

					        {selectedReport.Name ? 
								<input
									placeholder="Report Filter Name"
									value={stateObj.structureName}
									className="form-control"
									onChange={(e) => {
										self.setState({structureName: e.target.value})
									}}
									style={{
										margin: '8px 0px'
									}}
									/> : null}

					        {selectedReport.Name ? 
								<div style={{display: 'inline-block', margin: '0px 10px', verticalAlign: 'bottom', height: '60px', position: 'absolute', top: '75px', left: '100%'}}>
					        		<MenuItem 
					        			primaryText={<div onClick={this._loadReportStructureNames} style={{textDecoration: 'underline'}}>Load Filters</div>}
					        			rightIcon={<ArrowDropRight color="#aaa"/>}
					        			menuItems={stateObj.loadingReports ?
					        				[
					        					<MenuItem primaryText="Loading..." value=""/>
					        				] : 
					        				(stateObj.loadedStructures.length ?
					        					stateObj.loadedStructures.map(function (item, index) {
					        						return (
					        							<MenuItem 
					        								key={index}
					        								primaryText={item.StructureName} 
					        								value={item.Did}
					        								onTouchTap={(e) => {
					        									self._loadSpecificReport(item.Did);
					        								}}
					        								/>
					        						);
					        					}) : [
					        						<MenuItem primaryText="No Item Found!" value=""/>
					        					])
					        			}
					        			/>
									
								</div> : null}
					    </div> : null}

					{reportInfo.map(function (item, index) {
						mappedName[item.FieldName] = item.Name;
						if (item.Searchable != '1') return null;

						var getSelect_TextFieldItem = item;
						if (item.ShareWith) {
							if (shareWithShowed[item.ShareWith] !== true) {
								sharedFields.push(item.ShareWith);
								shareWithShowed[item.ShareWith] = true;
							}
							getSelect_TextFieldItem = null;
							return null;
						}

						return (
							<div key={index} className="col-sm-4">
								{item.Type == "date" ?
									(function () {
										var dateItem = stateObj.dateTypeFieldValues[item.FieldName];
										if (item.DateRange === true) {
											return (
												<div style={selectDefaultStyle}>
													<div style={{fontSize: '12px', fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.3)', marginTop: '3px'}}>{item.Name}</div>
													<div className="col-sm-6" style={{position: 'relative', overflow: 'hidden'}}>
														<DatePicker 
															value={dateItem.dateFrom ? new Date(parseInt(dateItem.dateFrom)) : null} 
															hintText="From" 
															container="inline" 
															onChange={(e, value) => {
																dateItem.dateFrom = value.getTime();
																self.forceUpdate();
															}}/>
															{dateItem.dateFrom ?
																<span 
																	style={{position: 'absolute', right: '0px', top: '15px', cursor: 'pointer'}} 
																	onClick={() => {
																		dateItem.dateFrom = "";
																		self.forceUpdate();
																	}}>
																	<ClearIcon color="#ccc" /*style={{height: '20px', width: '20px', fill: '#ccc'}}*//>
																</span> : null}
													</div>

													<div className="col-sm-6" style={{position: 'relative', overflow: 'hidden'}}>
														<DatePicker 
															value={dateItem.dateTo ? new Date(parseInt(dateItem.dateTo)) : null} 
															hintText="To" 
															container="inline" 
															onChange={(e, value) => {
																dateItem.dateTo = value.getTime();
																self.forceUpdate();
															}}/>
															{dateItem.dateTo ?
																<span 
																	style={{position: 'absolute', right: '0px', top: '15px', cursor: 'pointer'}} 
																	onClick={() => {
																		dateItem.dateTo = "";
																		self.forceUpdate();
																	}}>
																	<ClearIcon color="#ccc" /*style={{height: '20px', width: '20px', fill: '#ccc'}}*//>
																</span> : null}
													</div>
												</div>
											);
										}

										var value = dateItem.dateType;
										if (value == '__clear_all__') {
											value = "";
										}
										return (
											<div>
												<SelectField
										        	floatingLabelText={item.Name}
										          	value={value}
										          	onChange={(e, index, value) => {
										          		dateItem.dateType = value;
										          		self.forceUpdate();
										          	}}
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

										        {dateItem.dateType ? 
										        	self.render_dateTypeFilter(dateItem) : null
										        }

											</div>
										);
									}()) : 
									getSelect_TextField(getSelect_TextFieldItem)
								}
							</div>
						);
					})}

					{sharedFields.length ?
						<div style={{clear: 'both'}}>
							{sharedFields.map(function (item, index) {
								var selectedValue = stateObj.shareWithValues[item];
								var placeholder = [];
								var menuItems = [];
								item.split(',').map(function (i) {
									placeholder.push(mappedName[i]);
									menuItems.push({label: mappedName[i], value: i});
								})
								placeholder = placeholder.join('/');

								return (
									<div key={index} className="col-sm-4">
										<SelectField
								        	floatingLabelText={placeholder}
								          	value={selectedValue == "__clear_all__" ? "" : selectedValue}
								          	onChange={(e, index, value) => {
								          		filterValues[selectedValue] = Array.isArray(filterValues[selectedValue]) ? null : "";
								          		if (stateObj.cascadeFields[selectedValue]) {
								          			stateObj.ajaxFieldValues[stateObj.cascadeFields[selectedValue]] = [];
								          			filterValues[stateObj.cascadeFields[selectedValue]] = null;
								          		}
								          		stateObj.shareWithValues[item] = value;
								          		self.forceUpdate();
								          	}}
									        style={selectDefaultStyle}
						          			selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
								        >
							        		<MenuItem value={'__clear_all__'} primaryText={'Clear Item'} style={{color: 'white', backgroundColor: '#8b5656'}} />
								        	{menuItems.map(function (i, index) {
								        		return (
								        			<MenuItem key={index} value={i.value} primaryText={i.label} />
								        		);
								        	})}
								        </SelectField>

								        {getSelect_TextField(selectedValue ? reportInfo.find((i) => i.FieldName == selectedValue) : null)}
									</div>
								);
							})}
						</div> : null
					}

					{excFields && reportInfo.length ?
						<div className="row">
							<div className="col-sm-12" style={{margin: '15px 0px 6px'}}>
								<h4 style={{textDecoration: 'underline', marginLeft: '15px'}}>Exclude Fields:</h4>

								{reportInfo.map(function (item, index) {
									if (item.Hide == '1') return null;
									else if (!item.Name) {
										console.warn('Field "' + item.FieldName + '" doesn\'t have a name associated! Skipped for now!');
										item.Name = item.FieldName;
										//self.state.excludedFields[item.FieldName] = true;
										//return null;
									}
									return (
										<div key={index} style={{display: 'inline-block', margin: '6px 12px'}}>
											<Checkbox
										      label={item.Name}
										      checked={excludedFields[item.FieldName] ? true : false}
										      onCheck={(e, value) => {
										      	self.state.excludedFields[item.FieldName] = value;
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
						</div> : null}

					{reportInfo.length ?
				        <div className="col-sm-12">
				        	<div style={{textAlign: 'right'}}>
				        		{!reportName ?
					        		<RaisedButton
					        			label="Save Report Filter"
					        			labelPosition="before"
					        			onClick={this._saveReport}
					        			backgroundColor='#56a17b'
					        			labelStyle={{color: 'white'}}
					        			style={{
					        				margin: '0px 20px'
					        			}}
								      	icon={<BackUpIcon color='rgba(255, 255, 255, 0.870588)'/>}
								    /> : null}

				        		{filter || excFields ?
					        		<RaisedButton
					        			label="Filter"
					        			labelPosition="before"
					        			onClick={this._getData}
					        			backgroundColor={'rgb(87, 160, 167)'}
					        			labelStyle={{color: 'white'}}
					        			style={{
					        				margin: '0px 20px'
					        			}}
								      	icon={<NavigateNextIcon style={{}} color='rgba(255, 255, 255, 0.870588)'/>}
								    /> : null}
				        	</div>
				        </div> : null}

						{/*<div style={{overflow: 'auto', maxHeight: '1px', position: 'absolute', opacity: '1'}}>*/}
					{showTable ?
						<div style={{overflow: 'auto', position: 'relative', clear: 'both'/*, maxHeight: '400px'*/}}>
							{!reportName ? 
								(
									<div className="col-sm-12 text-center" style={{paddingBottom: '12px'}}>
										<TextField
											floatingLabelText="Custom Report Name"
											value={stateObj.customReportName}
											onChange={(e) => {
												this.setState({customReportName: e.target.value})
											}}
											style={{minWidth: '400px'}}
									    />
									</div>
								) : null}
							{/*<table className="table table-striped table-hover" style={{width: 'auto', margin: 'auto'}}>
								<tbody>
									<tr>
										{headers.map(function (item, index) {
											return (
												<td key={index} style={{padding: '0px', fontWeight: 'bold', borderTop: 'none'}}>
													<div style={{display: 'block', padding: '6px', whiteSpace: 'nowrap', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
													{item.label}
													</div>
												</td>
											);
										})}
									</tr>
									{tableData.data.map(function (item, index) {
										return (
											<tr key={index}>
												{headers.map(function (header, subIndex) {
													if (header.html) {
														return (
															<td key={subIndex} style={{padding: '0px'}}>
																<div dangerouslySetInnerHTML={{__html: item[header.value]}} style={{display: 'block', padding: '6px', whiteSpace: 'normal', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis'}}></div>
															</td>
														);
													}

													return (
														<td key={subIndex} style={{padding: '0px'}}>
															<div style={{display: 'block', padding: '6px', whiteSpace: 'normal', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
																{item[header.value]}
															</div>
														</td>
													);
												})}
											</tr>
										);
									})}
								</tbody>
							</table>*/}

							<ReactStickyTable
								ref="table"
								stickyRows={1}
								//columns={this.__tempColumns}
								columns={stateObj.stickyTableHeaders}
								//data={this.__temp}
								data={stateObj.stickyTableData}
								sortingIndex={stateObj.sortingIndex}
								sortingOrder={stateObj.sortingOrder}
								pageNumber={stateObj.pageNumber}
								tableLength={stateObj.tableLength}
								tableContainerMaxHeight={500}
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
								style={{
									padding: '12px',
									maxWidth: '1200px',
									margin: 'auto',
									display: 'block'
								}}
								/>
						</div> : null
					}
				</PremisePanel>
			</div>
		)
	}
});

module.exports = Report;
