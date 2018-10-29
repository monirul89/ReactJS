import React from 'react';
import ReactDOM from 'react-dom';
import Snackbar from 'node-snackbar';
// import SelectField from './General/CommonComponents/SelectField';
import SelectField from './General/CommonComponents/SelectField2';
// import MenuItem from 'material-ui/MenuItem';
// import TextField from './General/CommonComponents/TextField';
import TextField from './General/CommonComponents/TextField2';
// import DatePicker from 'material-ui/DatePicker';
import DatePicker from 'react-datepicker';
// ****Need to implement the DatePicker
import Checkbox from './General/CommonComponents/Checkbox';
import RaisedButton from './General/CommonComponents/RaisedButton';
// import NavigateNextIcon from 'material-ui/svg-icons/image/navigate-next';
// import BackUpIcon from 'material-ui/svg-icons/action/backup';
// import ExportIcon from 'material-ui/svg-icons/communication/call-made';
// import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
// import ClearIcon from 'material-ui/svg-icons/content/clear';
import Modal from './General/Modal';

/* ***CEM purpose */

import ActionCreator from '../Actions/ActionCreator';

/* ***CEM purpose (enclosed) */

import ExportModal from './ExportModal';

import ChartGenerator from './ChartGenerator/GraphEditor';

// import PremisePanel from './General/PremisePanel';
import TopLoader from './General/TopLoader';
// import ReactStickyTable from './General/react-sticky-table';
import ReactStickyTable from './General/react-sticky-table-flex';
// import ReactStickyTable from 'cm-react-sticky-table';

import commonFunctions from '../Utils/commonFunctions';
import ServerAPI from '../Utils/ServerAPI';
import exportXLSX from '../Utils/exportXLSX';
import docCookies from '../Utils/docCookies';

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
    // var date = new Date(dateTime);
    // var res = date.getDate().toString();
    // if (res.length < 2) res = '0' + res;

    // res = (date.getMonth() + 1) + res;
    // if (res.length < 4) res = '0' + res;

    // return date.getFullYear() + res;

    // ***Temporary purpose (commenting the above one, executing the below one)

    var date = new Date(dateTime);
    var res = date.getDate().toString();
    if (res.length < 2) res = '-0' + res;
    else res = '-' + res;

    res = (date.getMonth() + 1) + res;
    if (res.length < 5) res = '0' + res;

    return date.getFullYear() + '-' + res;
}

var selectDefaultStyle = {
	width: '400px',
	margin: '8px auto',
	display: 'block',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	maxWidth: '100%',
	position: 'relative'
}

var devEnv = process.env.NODE_ENV !== 'production';

if (devEnv) {
	if (!('__reserved__' in window)) {
		window.__reserved__ = {
			accessedFiles: {}
		}
	}

	if (!('accessedFiles' in window.__reserved__)) {
		window.__reserved__.accessedFiles = {};
	}

	if (!window.__reserved__.accessedFiles['Report.js']) {
		var getURLVar = () => "";
		var _t = window.__reserved__.accessedFiles['Report.js'] = {variables: {}};
		_t.variables.getURLVar = getURLVar;
		_t.variables.utilityLoaded = false;
		// window.__reserved__ = {
		// 	accessedFiles: {
		// 		'Report.js': {
		// 			variables: {
		// 				getURLVar: getURLVar
		// 			}
		// 		}
		// 	}
		// }
	} else {
		var getURLVar = window.__reserved__.accessedFiles['Report.js'].variables.getURLVar;
		var utilityLoaded = window.__reserved__.accessedFiles['Report.js'].variables.utilityLoaded;
	}
} else {
	var getURLVar = () => ""
	var utilityLoaded = false;
}

const movingScroller = navigator.userAgent.indexOf('Mac OS X') != -1 ? false : true;
// var movingScroller = false;

const defaultRowLimit = 50;

// var DialogStyle = window.top === window ? null : {
// 	paddingTop: '50px'
// }

var DialogClassName = null;

if (window.top !== window) {
	(function () {
		var _s = '.mui-dialog-custom{padding-top:50px !important}';
		var node = document.createElement('style');
		node.innerHTML = _s;
		document.head.appendChild(node);
		DialogClassName = 'mui-dialog-custom';
	}());
}

export default class Report extends React.Component {
	constructor (props) {
		super(props);
		var self = this;

		this.state = {
			reports: [],
			selectedReport: null,
			reportDid: "",
			reportInfo: [],
			filterValues: {},
			excludedFields: {},
			ajaxFieldValues: {},
			dateTypeFieldValues: {},
			checkBoxValues: {},
			cascadeFields: {},
			shareWithValues: {},
			tableData: null,
			tableDataLoaded: false,
			loaderArr: [{state: 'transit', title: 'Component rendering in progress!'}],
			customReportName: '',
			structureName: '',
			additionalData: null,
			loadingReports: false,
			loadedStructures: [],
			pageNumber: 1,
			sortingOrder: 0,
			sortingIndex: -1,
			activeTab: 'Table',
			tableLength: defaultRowLimit,
			utilityLoaded: utilityLoaded,
			exportModalView: false,
			stickyColumns: 0,
			totalRows: 0
		}

		this.shouldComponentUpdate = commonFunctions.defaultShouldComponentUpdate;
		this.getLoaderArr = commonFunctions.getLoaderArr.bind(this);

		[
			"_onTableParamChange",
			"_onReportNameChange",
			"_onSelectFieldChange",
			"_onTextFieldChange",
			"saveStateLocally",
			"_saveReport",
			"_loadSpecificReport",
			"_loadReportStructureNames",
			"getWhereObj",
			"getData",
			"_getData",
			// "_generateCSV",
			// "_generatePDF",
			"_generateCompleteReport",
			"_changeTab",
			"loadAjaxFields",
			"initializeReportKeys",
			"_showExportModal",
			"_closeExportModal",
			"_exportReport",
			"_applyStickyColumns",
			"onScroll"
		].map(function (fn) {
			self[fn] = self[fn].bind(self);
		})

		// this._generateCompleteReportXLSX = this._generateCompleteReport.bind(this, 'XLSX');
		// this._generateCompleteReportPDF = this._generateCompleteReport.bind(this, 'PDF');

		this.__rootRoute = commonFunctions.getRoute(2);

		this.__tabs = [];

		this.__snackbarMode = false;
	}

	_changeTab (tab) {
		this.setState({
			activeTab: tab
		})
	}

	_onTableParamChange (key, value, e) {
		/*var newState = null;
		if (key == "pageNumber") {
			newState = {pageNumber: value};
		} else if (key.search('sortingOrder') == 0) {
			newState = {sortingOrder: value};
		} else if (key.search('sortingIndex') == 0) {
			newState = {sortingIndex: value, sortingOrder: -1};
		}
		if (newState) window.navigate(this.__rootRoute + this.buildQuery(newState));*/

		var stateObj = this.state;
		var newState = null;
		var limit = stateObj.tableLength;
		var skip = (stateObj.pageNumber - 1) * limit;
		if (key == "pageNumber") {
			newState = {pageNumber: value};
			skip = (value - 1) * limit;
		} else if (key.search('sortingOrder') == 0) {
			newState = {sortingOrder: value};
		} else if (key.search('sortingIndex') == 0) {
			newState = {sortingIndex: value, sortingOrder: -1};
		} else if (key == "tableLength") {
			newState = {tableLength: value, pageNumber: 1};
			limit = value;
			skip = 0;
		}

		if (newState) this.setState(newState, this.getData.bind(this, {skip: skip, limit: limit}))
	}

	onScroll (e) {
		console.log(e);
	}

	componentDidMount () {
		var self = this;
		var props = this.props;
        var script = document.head.querySelector("script[data-component-name=Table2Excel]");

        var urlProp = props.url;
		if (!urlProp) {
			if ([
				'fieldExcludable',
				'showChart',
				'filter',
				'downloadable',
				'rowEditable',
				'callBack',
				'sum',
				'application',
				// 'name'
				'Did'
			].find(function (key, index) {
				return key in props;
			})) {
				getURLVar = function (key) {
					var obj = {
						'exc_fields': props.fieldExcludable || '0',
						'show_chart': props.showChart || '0',
						'filter': props.filter || '0',
						'downloadable': props.downloadable ? '1' : '0',
						'row_editable': props.rowEditable ? '1' : '0',
						'callback': props.callBack,
						'application': props.application,
						'sum': props.sum,
						'group': props.group,
						'aggregate': props.aggregate,
						'custom_name': props.customName,
						'custom_filter_state': props.customFilterState,
						'modifier': props.modifier,
						// 'name': props.name
						'Did': props.Did
					}
					return obj[key] || "";
				}
			} else {
				getURLVar = commonFunctions.getURLVar;
			}

		} else {
			getURLVar = commonFunctions.getURLVar_Custom.bind(null, urlProp);
		}

		if (devEnv) {
			window.__reserved__.accessedFiles['Report.js'].variables.getURLVar = getURLVar;
		}

        if (getURLVar('downloadable') == '1' && !script) {
        	setTimeout(function () {

        		return; // **Temporarily avoiding this

	        	self.setState({
	        		loaderArr: self.getLoaderArr({
	        			state: 'loading',
	        			title: 'Loading Converter Utilities',
	        			id: 'loadConverterUtilities'
	        		})
	        	})

	        	var rootSrc = './js/table2excel.min.js';
	        	var src = rootSrc.split('/');

	        	if (false && !devEnv) { // **Setting it false for plabon vaias convenience
		        	src.splice(src.length - 1, 0, 'jszipped');
		        	src[src.length - 1] += '.jpg';
	        	}

	        	src = src.join('/');
	        	var callBack = function (content, resource) {
	                var script = document.createElement('script');
	        		script.dataset.componentName = 'Table2Excel';
	                script.type = "text/javascript";
	                script.dataset.rootSrc = rootSrc;
	                script.innerHTML = content;
	                
	                document.head.appendChild(script);

	                if (devEnv) {
	                	window.__reserved__.accessedFiles['Report.js'].variables.utilityLoaded = true;
		        	}

	                utilityLoaded = true;
	                self.setState({
	        			loaderArr: self.getLoaderArr({
	        				id: 'loadConverterUtilities'
	        			}, 'delete'),
	        			utilityLoaded: true
	        		})
	            }

	        	var xhr = new XMLHttpRequest();
	            if (false && !devEnv) { // **Setting it false for plabon vaias convenience
		            xhr.responseType = 'arraybuffer';
	            } else {

	            }
	            xhr.open("GET", src);
	            xhr.onprogress = onprogress || null;
	            
	            xhr.onload = function (e) {
	                if (this.status == 200) {
	                    if (true || devEnv) { // **Setting it to true for plabon vaias convenience
				        	if (callBack) callBack(this.responseText);
			        	} else {
		                    JSZip.loadAsync(this.response).then(function (zip) {
		                        var files = zip.files;
		                        files[Object.keys(files)[0]].async("string").then(function (content) {
		                            if (callBack) callBack(content);
		                        })
		                        
		                    });
			        	}
	                } else {
	                    alert('download failed!'); // Maybe a retry could be applied
	                }
	            }
	            xhr.send();

        	});
        }

        this.__tabs = [{
			value: 'Table'
		}];

		// getURLVar('show_chart') == 1 ? this.__tabs.push({value: 'Chart'}) : void 0; // **Temporarily avoiding show_chart option

        // Lets make another way for receiving the application name instead of url

        var applicationName = decodeURIComponent(getURLVar('application'));
		// var reportName = decodeURIComponent(getURLVar('name'));
		var Did = getURLVar('Did');

		if (applicationName || Did) {
			var queryData = {
				moduleName: 'ReportList',
				where: {					
					Published: 'true'
					//Name: reportName
				},
				select: ['Did', 'UserId', 'ModuleName', 'Published', 'Name'],
				optimize: true
			}

			if (Did) {
				queryData.where.Did = Did;
			} else if (applicationName) {
				queryData.where.ApplicationName = {
					$regex: applicationName
				}
			}

			/* ***CEM purpose */

			// if (reportName) {
			// 	queryData.where.Name = reportName;
			// }

			/* ***CEM purpose (Enclosed) */


			self.setState(Object.assign({
        		loaderArr: self.getLoaderArr({
        			state: 'loading',
        			title: 'Loading Applicable Report(s)',
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
					/* ***CEM purpose */

					if (!res.Data.length) {
						alert('Unable to progress!');
						// console.error('No such report with the name - "' + reportName + '"');
						console.error('No such report with the Did - "' + Did + '"');
						return;
					}

					// this._onReportNameChange({}, 0, res.Data[0]);
					this._onReportNameChange({value: res.Data[0]});

					/* ***CEM purpose (Enclosed) */
        		})
			})
		}

		// window.addEventListener('beforeunload', this.saveStateLocally);
		// window.onbeforeunload = this.saveStateLocally;

		// commonFunctions.addListener('scroll', this.onScroll);
	}

	componentDidUpdate () {
		// **Temporary Hack
		if (!this.__row_editable_col_processed) {
			if (getURLVar('row_editable') != '1' && getURLVar('row_expandable') != '1') {
				this.__row_editable_col_processed = true;
			} else {
				var stickyTable = this.refs['table'];
				if (stickyTable) {
					var firstBlock = stickyTable.refs['container'].querySelector('.col-container').parentNode;
					firstBlock.style.overflow = 'hidden'; 
					firstBlock.style.flex = '0 0 30px'; 
					this.__row_editable_col_processed = true;
				}
			}
		}

		var loaderObj = this.state.loaderArr.find(i => i.state == 'loading');
		if (this.__snackbarMode && !loaderObj) {
			Snackbar.close();
			this.__snackbarMode = false;
		} else if (!this.__snackbarMode && loaderObj) {
			Snackbar.show({
            	pos: 'bottom-left',
            	text: loaderObj.title,
            	showAction: false,
            	duration: 0
            });
			this.__snackbarMode = true;
		}
	}

	componentWillReceiveProps (nextProps) {
		var props = this.props;
		var allowedKeys = Object.keys(nextProps);

		if ((allowedKeys.length != Object.keys(props).length) || allowedKeys.find(function (key, index) {
			return nextProps[key] !== props[key];
		})) {
			this.forceUpdate(this.componentDidMount);
		} else {
			this.__denyUpdate = true;
		}
	}

	componentWillUnmount () {
		// this.saveStateLocally();
		// // window.removeEventListener('beforeunload', this.saveStateLocally);
		// window.onbeforeunload = null;

		// commonFunctions.removeListener('scroll', this.onScroll);
	}

	saveStateLocally () {
		var stateObj = this.state;
		// var StructureName = stateObj.structureName;
		// if (!StructureName) {
		// 	return;
		// }

		var filterData = {
			filterValues: stateObj.filterValues,
			dateTypeFieldValues: stateObj.dateTypeFieldValues,
			excludedFields: stateObj.excludedFields,
			checkBoxValues: stateObj.checkBoxValues,
			shareWithValues: stateObj.shareWithValues
		}

		var ReportName = stateObj.selectedReport.Name;
		var MID = stateObj.selectedReport.Did;

		var prevData = localStorage.getItem('report-state');
		if (!prevData) prevData = {};
		else prevData = JSON.parse(prevData);

		prevData[stateObj.selectedReport.Did + (getURLVar('custom_name') || '')] = filterData;

		localStorage.setItem('report-state', JSON.stringify(prevData));
	}

	// _onReportNameChange (e, index, value) {
	_onReportNameChange (value) {
		value = value ? value.value : null;
		/* ***Temporary purpose */

		if (this.state.selectedReport === value) {
			if (devEnv) {
				console.info('Active Report Clicked!');
			}
			return;
		}

		if (this.state._temp_engaged) {
			alert('Please wait till the previous request is complete!');
			return;
		}
		this.state._temp_engaged = true;

		/* ***Temporary purpose (Enclosed) */

		var self = this;

		/* ***CEM purpose */
		// Graph Purpose

		ActionCreator.setReportBasics(value);

		/* ***CEM purpose (Enclosed) */

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
				select: ['Did', 'Fetch', 'FieldName', 'Name', 'Hide', 'Searchable', 'DefaultList', 'DefaultListType', 'CascadeField', 'ShareWith', 'Code', 'Css'],
				optimize: true
			}

			var group = getURLVar('group');
			var aggregate = getURLVar('aggregate');

        	var modifier = getURLVar('modifier');
        	if (modifier) {
        		if (typeof modifier == 'string') {
	        		modifier = JSON.parse(modifier);
        		}
        	} else {
        		modifier = null;
        	}

        	var customFields = null;

			if (group && aggregate) {
				customFields = [group, aggregate];
			}

			if (modifier) {
				var modifierFields = Object.keys(modifier);
				if (customFields) {
					var _customFields = [].concat(customFields);
					modifierFields.map(function (fn) {
						if (!customFields.find((i) => i == fn)) _customFields.push(fn);
					})
					modifierFields = _customFields;
				}

				customFields = modifierFields;
			}

			// if (customFields) {
			// 	queryData.where.FieldName = {
			// 		"$in": customFields
			// 	}
			// }

			self.setState(Object.assign({
        		loaderArr: self.getLoaderArr({
        			state: 'loading',
        			title: 'Loading Report Basics!',
        			id: 'loadReportBasics'
        		}),
        		structureName: ""
        	}, self.initializeReportKeys()));

        	var getStructure = function (reportInfo) {
        		// var reportInfo = res.Data;

        		var queryData_2 = {
        			moduleName: 'ReportListDetails_Structure',
        			where: {
        				MID: MID
        			},
        			select: ['Field', 'Type', 'Module', 'ShowAs'],
        			optimize: true
        		}

        		ServerAPI.aggregate(queryData_2, function (res_2) {
        			/* ***CEM purpose */
        			// Graph Purpose
        			
        			var structureData = [];

					/* ***CEM purpose (Enclosed) */

        			res_2.Data.map(function (item) {
        				reportInfo.find(function (i) {
        					var fieldName = item.ShowAs || (item.Module + "." + item.Field);
        					if (i.FieldName == fieldName) {
        						/* ***CEM purpose */
			        			// Graph Purpose

	        					if (item.ShowAs != '__Master_Did') {
	        						var _newRow = Object.assign({}, item);
	        						_newRow.ShowAs = i.Name || fieldName;
	        						_newRow.Field = i.FieldName;
	        						structureData.push(_newRow);
			        			}

		        				/* ***CEM purpose */

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

        			var newState = {
	        			loaderArr: self.getLoaderArr({
	        				id: 'loadReportBasics'
	        			}, 'delete'),
	        			reportInfo: reportInfo 
	        		}

	        		var prevLSData = JSON.parse(localStorage.getItem('report-state') || "{}"); // previous local-storage data
	        		var savedState = prevLSData[MID + (getURLVar('custom_name') || '')];

	        		if (devEnv) {
		        		console.log(reportInfo);
	        		}

	        		if (savedState) {
		        		var updateLS = false; // Should the local-storage be updated!
		        		for (var ssk in savedState) { // ssk => savedStateKey
	        				var _ak = {}; // _ak => available Keys!
		        			if (ssk == 'shareWithValues') {
			        			reportInfo.map((i) => {
			        				if (i.Searchable == '1' && i.ShareWith) {
				        				_ak[i.ShareWith] = true;
			        				}
			        			})
		        			} else if (ssk == 'excludedFields') {
			        			reportInfo.map((i) => {
			        				if (i.Hide != '1') {
				        				_ak[i.FieldName] = true;
				        			}
			        			})
		        			} else if (ssk == 'checkBoxValues') {
			        			reportInfo.map((i) => {
			        				if (i.Searchable == '1' && i.DefaultListType == 'Checkbox') {
				        				_ak[i.FieldName] = true;
			        				}
			        			})
		        			} else if (ssk == 'dateTypeFieldValues') {
			        			reportInfo.map((i) => {
			        				if (i.Searchable == '1' && i.Type == 'date') {
				        				_ak[i.FieldName] = true;
			        				}
			        			})
		        			} else if (ssk == 'filterValues') {
			        			reportInfo.map((i) => {
			        				if (i.Searchable == '1' && i.Type == 'string' && !i.ShareWith) {
				        				_ak[i.FieldName] = true;
			        				}
			        			})
		        			}

		        			if (devEnv) {
			        			console.log('key : available-keys', ssk + " : ", _ak);
			        		}

		        			var _s = savedState[ssk]; // _s => state | value of the key

		        			for (var field in _s) {
		        				if (!_ak[field]) {
		        					updateLS = true;
		        					delete _s[field];
		        					console.log('Deleting sub-key of a key', 'key : sub-key', ssk + " : " + field);
		        				}
		        			}
		        		}

		        		if (updateLS) {
							prevLSData[MID + ((getURLVar('custom_name') || ''))] = savedState;
							localStorage.setItem('report-state', JSON.stringify(prevLSData));
		        		}

	        		} else {
	        			savedState = {};
	        		}

	     //    		var mod_savedState = {
	     //    			dateTypeFieldValues: {
						//     "ExpiryDate": {
						//         "year": [
						//             "2017"
						//         ],
						//         "month": [
						//             "6"
						//         ],
						//         "quarter": "",
						//         "dateType": "Month"
						//     }
						// }
	     //    		};

	        		var mod_savedState = getURLVar('custom_filter_state');
	        		if (typeof mod_savedState == 'string') {
	        			mod_savedState = JSON.parse(mod_savedState || "{}");
	        		}

	        		console.log(mod_savedState);
	        		console.log(newState);

	        		var stateObj = self.state;
	        		for (var key in mod_savedState) {
	        			mod_savedState[key] = Object.assign(stateObj[key], mod_savedState[key]);
	        		}

        			Object.assign(newState, mod_savedState); // Setting saved report-state from localStorage

        			/* ***CEM purpose */
        			// Graph Purpose

        			ActionCreator.setReportStructure(structureData);

					/* ***CEM purpose (Enclosed) */


        			/* ***CEM purpose */

        			//var _callBack = getURLVar('name') ? self.loadAjaxFields.bind(self, self.getData.bind(self, {limit: 10})) : self.loadAjaxFields;
					var _callBack = self.loadAjaxFields.bind(self, self.getData.bind(self, {limit: defaultRowLimit}, {getSummation: true}));

					/* ***CEM purpose (Enclosed) */

					self.setState(newState, _callBack)
        		})
        	}

        	ServerAPI.aggregate(queryData, function (res) {
        		if (res.Status == 'Success') {
        			var reportInfo = res.Data;
    				reportInfo.map(function (item, index) {
	        			if (modifier) {
        					Object.assign(item, modifier[item['FieldName']] || null);
	        			}
	        			if (item.Code) {
	        				eval("item.Code = `" + item.Code + "`;");
	        			}
    				})
        			getStructure(reportInfo);
        		} else {
        			alert('Request failed! Please make the request once again!');
        		}
			})
		} : null)
	}

	// _onSelectFieldChange (key, e, index, value) {
	_onSelectFieldChange (key, value) {
		var val;
		if (devEnv) {
			console.log('_onSelectFieldChange', arguments);
		}
		if (Array.isArray(value)) {
			value = value.map(v => v.value);
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
	}

	_onTextFieldChange (key, e, val) {
		var filterValues = this.state.filterValues;
		filterValues[key] = val;
		this.setState({filterValues: filterValues});
	}

	_saveReport () {
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
			checkBoxValues: stateObj.checkBoxValues,
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
	}

	_loadSpecificReport (Did) {
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
	}

	_loadReportStructureNames () {
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
	}

	getWhereObj () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;
		var whereObj = {};

		var reportInfo = stateObj.reportInfo;

		var filterValues = stateObj.filterValues;
		var checkBoxValues = stateObj.checkBoxValues;
		var dateTypeFieldValues = stateObj.dateTypeFieldValues;

		Object.keys(filterValues).map(function (key, index) {
			var value = filterValues[key];
			if (Array.isArray(value)) {
				if (value.length) {
					if (value.length > 1) {
						whereObj[key] = {$in: value};
					} else if (value[0] != '__clear_all__') {
						whereObj[key] = value[0];	
					} 
				}
			} else if (value) {
				whereObj[key] = {
					$regex: value,
					$options: 'i'
				}
			}
		})

		Object.keys(checkBoxValues).map(function (key, index) {
			var defaultList = reportInfo.find(i => i.FieldName == key).DefaultList;
			var CBV = checkBoxValues[key]; // CBV => checkBoxValue (single)
			var val = [];
			for (var l in CBV) { // `l` is equivalent to the label of the checkbox item
				var item = defaultList.find(i => i.l == l);
				if (item) {
					val = val.concat(item.v);					
				}
			}

			var len = val.length;
			if (len) {
				if (len > 1) {
					whereObj[key] = {
						$in: val
					}
				} else {
					whereObj[key] = val[0];
				}
			}
		})

		Object.keys(dateTypeFieldValues).map(function (key, index) {

			var item = dateTypeFieldValues[key];

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
					$regex: (year || '....') + ('(-*)') + (month || '..')
				}
			}
		});

		if (devEnv) {
			console.log('whereObj', whereObj);
		}

		var getWhereObj = props.getWhereObj;
		if (typeof getWhereObj == 'function') {
			var res = getWhereObj(whereObj);
			if (res && typeof res == 'object') {
				return res;
			}
		}

		return whereObj;
	}

	getHeaders (queryDataExt) {
		queryDataExt = queryDataExt || {};
		var stateObj = this.state;
		var headers = [];
		var selectObj = [];
		var selectGiven = false;
		var givenSelectObj = {};
		if ('select' in queryDataExt) {
			queryDataExt.select.map(FN => {
				givenSelectObj[FN] = true;
			})

			selectGiven = true;
		}

		stateObj.reportInfo.map(function (i) {
			if (i.FieldName == '__Master_Did') {
				selectObj.push('__Master_Did');
				return;
			};
			if (i.Hide != '1') {
				var fieldName = i.FieldName;
				var fn = null;
				if (i.Code) {
					fn = new Function('item', i.Code.replace(/_p_Lu_S_/g, '+'));
				}

				var cssText = i.Css;
				var style = cssText ? commonFunctions._getCssObject(cssText) : null; 

				if (selectGiven) {
					if (fieldName in givenSelectObj) {
						selectObj.push(fieldName);
						headers.push({label: i.Name, value: fieldName, code: fn, style: style, cssText: cssText});
					}
				} else {
					if (stateObj.excludedFields[fieldName] !== true) {
						selectObj.push(fieldName);
						headers.push({label: i.Name, value: fieldName, code: fn, style: style, cssText: cssText});
					}
				}
			}
		})

		return {
			selectGiven: selectGiven,
			headers: headers,
			selectObj: selectObj
		}
	}

	getData (queryDataExt, options, callBack) {
		var self = this;
		options = options || {};
		var stateObj = this.state;
		queryDataExt = queryDataExt || (function () {
			var limit = stateObj.tableLength;
			var skip = (stateObj.pageNumber - 1) * limit;
			return {
				skip: skip,
				limit: limit
			}
		}()); 

		var stickyTableData = [];
  		// self.refs['scroll-pos'].scrollIntoView({behavior: 'smooth'});
  		self.refs['scroll-pos'].scrollIntoView();

  		var selectedReport = stateObj.selectedReport;

		var scopeRes = null;

		var whereObj = {};		

		var skip = queryDataExt.skip || 0;
		var sortingOrder = stateObj.sortingOrder;
		var sortingIndex = stateObj.sortingIndex;

		var moduleName = selectedReport.ModuleName;

		var {headers, selectObj, selectGiven} = this.getHeaders(queryDataExt);
		if (selectGiven) {
			delete queryDataExt.select;
		}

		whereObj = this.getWhereObj();

		var postQueryFn = null;

		var queryData = {
			moduleName: moduleName,
			where: whereObj,
			select: ['Did'].concat(selectObj),
			optimize: true
		}

		Object.assign(queryData, queryDataExt);

		var group = getURLVar('group');
		var aggregate = getURLVar('aggregate');

		if (group && aggregate) {
			delete queryData.select;
			delete queryData.optimize;
			if (!Object.keys(whereObj).length) {
				delete queryData.where;
			}
			// queryData.where.select.find(function (i, index) {
			// 	if (i == 'Did') {
			// 		queryData.where.select.splice(index, 1);
			// 		return true;
			// 	}
			// 	return false;
			// })

			queryData.group = {
				'_id': '$' + group,
				[group]: {
					'$first': '$' + group
				},
				[aggregate]: {
					'$push': '$' + aggregate
				}
			}
		}

		if (devEnv) {
			console.log('queryData', queryData);
		}

		this.saveStateLocally();

		if (queryData.limit == 'All') queryData.limit = 0;


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

			if (!selectGiven && sortingOrder) { // We're not applying sorting order when user asks for a complete report! (we turn the selectGiven to on then)
				if (sortingIndex > 0) {
					queryData.orderBy = {
						[headers[sortingIndex].value]: sortingOrder
					}
				}
			}

			ServerAPI.aggregate(queryData, function (res) {

				if (group && aggregate) {
					res.Data = JSON.parse(res.Data);

					res.Data.map(function (row, ri) { // ri => rowIndex
						var colSum = 0;
						row[aggregate].map(function (i) {
							var v = parseFloat(i);
							if (!isNaN(v)) {
								colSum += v;
							}
						})
						row[aggregate] = colSum.toString();
					});
				}

				var newState = {
					loaderArr: self.getLoaderArr({
						id: 'retrieveData'
					}, 'delete')
				}

				if (!options.getDataOnly) {
					scopeRes = [];
					var tableData = null;
					var stickyTableHeaders = [];
					var additionalData = [];

					if (res.Status == "Success") {
						scopeRes = res.Data;

						tableData = {
							data: scopeRes,
							headers: headers
						};

						// var _headers = headers.map((i) => i.value);
						scopeRes.map(function (item, index) {
							var row = [];
							headers.map(function (header, sIndex) {
								var sItem = header.value;
								var val = item[sItem];

								if (header.code) {
									var fVal = header.code(val); // Formatted Value
									if (typeof fVal != 'undefined') val = fVal;
								}

								row.push({
									label: val,
									style: header.style
								}) 
							})
							row[0].item = item;
							// stickyTableData[skip + index] = row;
							stickyTableData[index] = row;
						})

						var summationData = self.summationData;
						var showSummation = scopeRes.length && summationData;
						additionalData = [[], []];
						var sumFieldFound = false;
						headers.map((i, index) => {
							var FN = i.value;
							stickyTableHeaders.push({label: i.label || FN, style: i.style || null})

							if (showSummation) {
								var obj = summationData.find(i => i.field == FN);
								if (obj) {
									sumFieldFound = true;

									var sumVal = scopeRes.reduce(function (acc, item, index) {
										var val = parseFloat(item[FN]);
										if (!isNaN(val)) acc += val;
										return acc;
									}, 0).toString();

									var totalVal = obj.value.toString();

									if (i.code) {
										var fVal = i.code(sumVal); // Formatted Value
										if (typeof fVal != 'undefined') sumVal = fVal;

										fVal = i.code(totalVal); // Formatted Value
										if (typeof fVal != 'undefined') totalVal = fVal;
									}

									var _s = i.style;

									additionalData[0].push({
										labelNode: (
											<b>
												{sumVal}
											</b>
										),
										style: _s
									})

									additionalData[1].push({
										labelNode: <b>{totalVal}</b>,
										style: _s
									});
								} else {
									additionalData[0].push(null);
									additionalData[1].push(null);
								}
							}

						});

						if (showSummation && sumFieldFound) {
							additionalData[0][0] = {labelNode: <b>Sub-Total</b>};
							additionalData[1][0] = {labelNode: <b>Total</b>};

							if (getURLVar('row_editable') == '1' || getURLVar('row_expandable') == '1') {
								additionalData[0].unshift({label: ''});
								additionalData[1].unshift({label: ''});
							}
						} else {
							additionalData = [];
						}
					}

					if (self.refs.table) {
						var partialTableProps = {
							data: stickyTableData,
							headers: stickyTableHeaders,
							additionalData: additionalData
						};

						postQueryFn = self.refs['table'].update.bind(null, partialTableProps);
					}

					var rowEditable = getURLVar('row_editable') == '1';
					var rowExpandable = getURLVar('row_expandable') == '1';

					if (rowEditable || rowExpandable) {
						var RET = rowEditable ? 'Edit' : null; // RET => rowEditTitle
						var REICN = rowEditable ? 'fa fa-edit' : 'fa fa-expand'; // REICN => rowEditIconClassName
						stickyTableHeaders.unshift({label: "", sortable: false, skipOnDetails: true});
						stickyTableData.map(function (item, index) {
							if (!item) return;
							item.unshift({
								labelNode: (
									<span 
										onClick={() => {
											var callBack = getURLVar('callback');
											if (!callBack) return;
											callBack = window.top[callBack];
											if (!callBack) return;
											callBack(item[1].item);
										}}
										title={RET}
										>
										<i className={REICN} style={{color: '#0288D1', verticalAlign: 'middle', cursor: 'pointer'}}></i>
									</span>
								)
							})
						})
					}

					Object.assign(newState, {
						tableData: tableData,
						stickyTableData: stickyTableData,
						stickyTableHeaders: stickyTableHeaders,
						additionalData: additionalData,
						//tableDataLoaded: postQueryFn ? false : true
						tableDataLoaded: true
					})
				}

				self.setState(newState, postQueryFn);

				/* ***Temporary purpose */
				
				self.state._temp_engaged = false;

				/* ***Temporary purpose (Enclosed) */

				if (callBack) {
					callBack({
						data: res.Data,
						headers: headers
					})
				}
			})
		}

		var _getCount = function () {
			var _queryData = {
				moduleName: moduleName,
				where: whereObj,
				count: true
			}

			if ('group' in queryData) {
				_queryData.group = {
					'_id': '$' + group,
					[group]: {
						'$first': '$' + group
					},
					[aggregate]: {
						'$push': '$' + aggregate
					}
				}
			}

			ServerAPI.aggregate(_queryData, function (res) {
				var newState = {};
				if (res.Status != 'Success') {
					// Error Handler!
					return;
				}

				var tableDataLen = parseInt(res.Data);
				newState.totalRows = tableDataLen;
				// stickyTableData = new Array(tableDataLen);
				if (tableDataLen <= skip) {
					skip = queryData.skip = 0;
					newState.pageNumber = 1;
				}

				if (options.getSummation) {
					self.setState(newState, self.getSummation.bind(self, null, _getData));
				} else {
					self.setState(newState, _getData);
				}

			})

		}

		if (!options.getDataOnly) {
			_getCount();
		} else {
			_getData();
		}

	}

	getSummation (data, callBack) {
		var self = this;
		var stateObj = this.state;
		var select = getURLVar('sum');
		if (select == '') {
			if (callBack) callBack(); // No summation is possible
			return;
		}
		select = decodeURIComponent(select).split(',');
		var reportInfo = stateObj.reportInfo;
		var summationData = {};
		select.map(function (field) {
			var row = reportInfo.find(function (i) {
				return i.FieldName == field;
			});
			if (row) {
				summationData[field] = {
					field: field,
					label: row.Name || field,
					value: 0
				}
			} else {
				alert('Error Occurred! Summation field doesnt correspond to any existing report table fields!');
				console.error('Check if the reportInfo object is properly configured in the components .state and if the summation fields are in fact part of the report table!');
			}
		})

		var selectedReport = stateObj.selectedReport;
		var moduleName = selectedReport.ModuleName;

		var queryData = {
			moduleName: moduleName,
			select: select,
			where: this.getWhereObj(),
			optimize: true
		}

		this.setState({
			loaderArr: self.getLoaderArr({
				state: 'loading',
				title: 'Generating Summation Data!',
				id: 'getSummationData'
			})
		})

		ServerAPI.aggregate(queryData, function (res) {
			var newState = {
				loaderArr: self.getLoaderArr({
					id: 'getSummationData'
				}, 'delete')
			}

			if (res.Status == 'Success') {
				var data = res.Data;

				data.map(function (item) {
					select.map(function (field) {
						var val = item[field];
						if (!val) return;
						var prevVal = summationData[field].value;
						var num = parseFloat(val.replace(/,/g, ''));
						if (!isNaN(num)) {
							summationData[field].value = prevVal + num;
						}
					})
				})
				// newState.summationData = Object.keys(summationData).map((i) => summationData[i]);
			} else {
				// Handle Error
			}

			/* Temporary Purpose */

			self.summationData = Object.keys(summationData).map((i) => summationData[i]);
			
			/* Temporary Purpose (Enclosed) */

			self.setState(newState, callBack);
		})

	}

	_getData (e) {
		this.getData(null, {getSummation: true});
	}

	// _generateCSV () {
 //  		//exportXLSX(this.refs['scroll-pos'].querySelector('table'), {firstRowAsHeader: true, fileType: 'xlsx', workSheetName: 'Sample Report', fileName: this.state.customReportName || 'Sample Report'});
	
	// 	/* ***Temporary Purpose */
	// 	var name = this.state.customReportName || 'Sample Report';

	// 	var rowEditable = getURLVar('row_editable') == '1' ? true : false;
 //  		var table = this.refs['scroll-pos'].querySelector('table').cloneNode(true);
	// 	Array.from(table.rows).map(function (item, index) {
	// 	    item.removeChild(item.firstElementChild);
	// 	    if (rowEditable) item.removeChild(item.firstElementChild);
	// 	})

	// 	var thead = this.refs['scroll-pos'].querySelector('thead').cloneNode(true);
	// 	for (var _t = 0; _t < 1 + (rowEditable ? 1 : 0); _t++) thead.firstElementChild.removeChild(thead.rows[0].firstElementChild);
	// 	table.insertBefore(thead, table.firstElementChild);
	// 	table.id = 'temp-csv-table';

	// 	document.body.insertAdjacentHTML('beforeend', table.outerHTML);

 //  		exportXLSX(document.querySelector('#temp-csv-table'), {firstRowAsHeader: true, fileType: 'xlsx', workSheetName: name, fileName: name});
	// 	document.querySelector('#temp-csv-table').remove();
	// 	/* ***Temporary Purpose */
	// }

	// _generatePDF () {
 //  		/*var self = this;
 //  		self.refs['scroll-pos'].scrollIntoView({behavior: 'smooth'});

 //  		this.setState({
 //  			loaderArr: this.getLoaderArr({
 //  				state: 'loading',
 //  				title: 'Generating PDF!',
 //  				id: 'generatePDF'
 //  			})
 //  		})

 //        ServerAPI.getPDF({
 //        	name: this.state.customReportName || 'Sample Report',
 //        	html: '<h2 style="text-align:center;margin-bottom:12px">' + (this.state.customReportName || 'Sample Report')  + '</h2>' + this.refs['scroll-pos'].querySelector('table').outerHTML + '<div style="text-align:center;margin-top:15px">Row Count: ' + this.state.tableData.data.length + '</div>'
 //        }, function (res) {
 //        	//console.log(res);
 //        	self.setState({
 //        		loaderArr: self.getLoaderArr({id: 'generatePDF'}, 'delete')
 //        	})
 //        })*/

 //        /* ***Temporary Purpose */

 //        var self = this;
 //  		self.refs['scroll-pos'].scrollIntoView({behavior: 'smooth'});

 //  		this.setState({
 //  			loaderArr: this.getLoaderArr({
 //  				state: 'loading',
 //  				title: 'Generating PDF!',
 //  				id: 'generatePDF'
 //  			})
 //  		})

	// 	var rowEditable = getURLVar('row_editable') == '1' ? true : false;
		
 //  		var table = this.refs['scroll-pos'].querySelector('table').cloneNode(true);
	// 	Array.from(table.rows).map(function (item, index) {
	// 	    item.removeChild(item.firstElementChild);
	// 	    if (rowEditable) item.removeChild(item.firstElementChild);
	// 	})

	// 	var initialRow = document.createElement('tr');
	// 	var thead = this.refs['scroll-pos'].querySelector('thead');
	// 	Array.from(thead.rows[0].cells).map(function (cell, index) {
	// 		var newCell = document.createElement('td');
	// 		newCell.innerHTML = cell.innerHTML;
	// 		initialRow.appendChild(newCell);
	// 	})
	// 	for (var _t = 0; _t < 1 + (rowEditable ? 1 : 0); _t++) initialRow.removeChild(initialRow.firstElementChild);

	// 	var tbody = table.firstElementChild;
	// 	tbody.insertBefore(initialRow, tbody.firstElementChild);

	// 	//table.querySelectorAll('td, th').forEach(function (node) {
	// 	//	node.style.padding = '8px';
	// 	//})

	// 	initialRow.style.cssText = 'background-color:#e4ecec;font-weight:bold';
	// 	//table.tBodies[0].querySelectorAll('tr:nth-child(2n)').forEach(function (node) {
	// 	//	node.style.backgroundColor = '#ebecec';
	// 	//})

	// 	table.querySelectorAll('*').forEach(function (node) {
	// 		node.style.removeProperty('white-space');
	// 	})

	// 	table.className = 'table table-striped';

	// 	var name = this.state.customReportName || 'Sample Report';

 //        ServerAPI.getPDF({
	//         name: name,
 //        	html: '<h2 style="text-align:center;margin-bottom:12px">' + (name)  + '</h2>' + table.outerHTML + '<div style="text-align:center;margin-top:15px">Row Count: ' + this.state.tableData.data.length + '</div>'
 //        }, function (res) {
 //        	//console.log(res);
 //        	self.setState({
 //        		loaderArr: self.getLoaderArr({id: 'generatePDF'}, 'delete')
 //        	})
 //        })

 //        /* ***Temporary purpose Enclosed */
	// }

	_generateCompleteReport (type, queryDataExt, config) {
		var self = this;
		this.getData(queryDataExt || {}, {getDataOnly: true}, function (res) {
			self.setState({
	  			loaderArr: self.getLoaderArr({
	  				state: 'loading',
	  				title: 'Generating Data!',
	  				id: 'generateCompleteReport'
	  			})
	  		})

			//var newFrag = document.createDocumentFragment();
			var table = document.createElement('table');
			//newFrag.appendChild(table);
			var tbody = document.createElement('tbody');
			table.appendChild(tbody);
			var headers = res.headers;
			var firstRow = {};
			headers.map((i) => {
				var val = i.value;
				firstRow[val] = i.label;
			});

			var resData = res.data;

			var _reg = () => { // _reg => row element getter
				return document.createElement('tr');
				// var tr = document.createElement('tr');
				// tr.setAttribute('style', 'page-break-inside:avoid');
				// return tr;
			}

			// // *PDF header testing purpose (a portion inside it is important, examine that before deleting this whole portion)

			// var pdfHeader = commonFunctions.getURLVar('pdf_header') === '1';
			// if (pdfHeader) { // This will be integrated once header overlapping issue is fixed
			// 	var thead = document.createElement('thead');
			// 	var row = firstRow;
			// 	var tr = _reg();
			// 	headers.map((header, index) => {
			// 		var th = document.createElement('th');
			// 		th.innerText = row[header.value] || "";
			// 		tr.appendChild(th);
			// 	});
			// 	thead.appendChild(tr);
			// 	table.insertBefore(thead, table.firstElementChild);
			// } else { // This portion is used temporarily, once header overlapping issue is fixed this will be removed
			// 	var row = firstRow;
			// 	var tr = _reg();
			// 	headers.map((header, index) => {
			// 		var td = document.createElement('td');
			// 		td.innerText = row[header.value] || "";
			// 		tr.appendChild(td);
			// 	});
			// 	tbody.appendChild(tr);
			// }

			// End of PDF header testing


			// data.unshift(firstRow);

			var thead = document.createElement('thead');
			var row = firstRow;
			var tr_th = document.createElement('tr');
			headers.map((header, index) => {
				var th = document.createElement('th');
				th.innerText = row[header.value] || "";
				tr_th.appendChild(th);
			});
			thead.appendChild(tr_th);
			table.insertBefore(thead, table.firstElementChild);

			resData.map(function (row, index) {
				var tr = _reg();
				headers.map((header, index) => {
					var key = header.value;

					var val = row[key] || '';

					if (header.code) {
						var fVal = header.code(val); // Formatted Value
						if (typeof fVal != 'undefined') val = fVal;
					}

					var cssText = header.cssText;

					var td = document.createElement('td');
					if (val) {
						td.innerText = val;
					} else if (!index) {
						td.innerHTML = '<span style="visibility:hidden">X</span>';
					}
					if (cssText) td.style.cssText = cssText;
					tr.appendChild(td);
				});
				tbody.appendChild(tr);
			})

			var sumFields = getURLVar('sum');
			if (sumFields != '') {
				sumFields = decodeURIComponent(sumFields).split(',');
				var tr = _reg();
				var sumFieldFound = false;
				headers.map((header, index) => {
					var key = header.value;
					var td = document.createElement('td');
					if (sumFields.indexOf(key) > -1) {
						var sumVal = resData.reduce(function (acc, item, index) {
							var val = parseFloat(item[key]);
							if (!isNaN(val)) acc += val;
							return acc;
						}, 0).toString();

						if (header.code) {
							var fVal = header.code(sumVal); // Formatted Value
							if (typeof fVal != 'undefined') sumVal = fVal;
						}

						var cssText = header.cssText;

						sumFieldFound = true;
						td.innerHTML = '<b>' + sumVal + '</b>';
						if (cssText) td.style.cssText = cssText;
					}
					tr.appendChild(td);
				});

				if (sumFieldFound) {
					tr.cells[0].innerHTML = '<b>Total</b>';
					tbody.appendChild(tr);
				}
			}

			table.className = 'table';
			table.rows[0].style.cssText = 'background-color:#e4ecec;font-weight:bold';

        	/* ***Temporary Purpose */

        	// document.body.appendChild(table);

        	// Array.from(tbody.rows).forEach(row => {
        	// 	row.setAttribute('style', 'page-break-inside:avoid')
        	// 	// row.style.cssText = 'page-break-inside: avoid;';
        	// })

			// table.ondblclick = function () {
			// 	var name = config.name || self.state.selectedReport.Name;

			// 	var html = '<h2 style="text-align:center;margin-bottom:12px">' + (name)  + '</h2>' + table.outerHTML + '<div style="text-align:center;margin-top:15px;font-weight:bold;font-size:1.1em">Row Count: ' + resData.length + '</div>';
			// 	html = '<div><style>tr{page-break-inside: avoid;}</style>' + html + '</div>';

			// 	self.setState({
			// 		loaderArr: self.getLoaderArr({
			// 			state: 'loading',
			// 			title: 'Generating PDF',
			// 			id: 'generateTestPDF'
			// 		})
			// 	})

			// 	ServerAPI.getPDF({
			//     	name: name,
			//     	html: html,
			//     	config: {
			//     		size: config.paperSize,
			//         	height: config.paperHeight,
			//         	width: config.paperWidth,
			//         	orientation: config.paperOrientation
			//         }
			//     }, function (res) {
			//     	self.setState({
			//     		loaderArr: self.getLoaderArr({id: 'generateTestPDF'}, 'delete')
			//     	})
			//     })
			// }

        	// self.setState({
        	// 	loaderArr: self.getLoaderArr({id: 'generateCompleteReport'}, 'delete')
        	// })
        	// return;

        	/* ***Temporary Purpose (Enclosed) */

        	/* ***Temporary Purpose */

        	// table.querySelectorAll('td').forEach((node) => {
        	// 	node.style.padding = '8px';
        	// })

        	// document.body.appendChild(table);

        	/* ***Temporary Purpose (Enclosed) */

        	// Object.assign(config, {
        	// 	columnDivider: false,
        	// 	rowDivider: true,
        	// 	alternateRowColor: false,
        	// 	tableCondensed: true
        	// })

			var name = config.name || self.state.selectedReport.Name;

        	/* ***Temporary Purpose (Enclosed) */

			// var printWindow = window.open();
			// printWindow.document.body.innerHTML = html;

			// self.setState({
			// 	loaderArr: self.getLoaderArr({id: 'generateCompleteReport'}, 'delete')
			// })
			// return;

        	/* ***Temporary Purpose (Enclosed) */

			if (type == 'PDF') {
				var styleHTML = '';
				styleHTML += '<style>';
				styleHTML += 'thead{display:table-header-group}tfoot{display:table-row-group}tr{page-break-inside:avoid}';
				if (config.columnDivider || config.rowDivider) {
					styleHTML += '.table>tbody>tr>td, .table>tbody>tr>th, .table>tfoot>tr>td, .table>tfoot>tr>th, .table>thead>tr>td, .table>thead>tr>th{';
					if (config.columnDivider) {
						styleHTML += 'border-right: 1px solid #ddd !important;';
					}
					if (config.rowDivider) {
						styleHTML += 'border-top: 1px solid #ddd !important;';
					}
					styleHTML += "}"
				}

				if (config.alternateRowColor) {
					table.classList.add('table-striped');
				}

				if (config.tableCondensed) {
					table.classList.add('table-sm');
				} else {
					styleHTML += '.table>tbody>tr>td, .table>tbody>tr>th, .table>tfoot>tr>td, .table>tfoot>tr>th, .table>thead>tr>td, .table>thead>tr>th{';
					styleHTML += 'padding:6px;line-height:1.42857143';
					styleHTML += '}';
				}

				var fontSize = parseFloat(config.fontSize);
				if (!isNaN(fontSize)) {
					styleHTML += 'td,th{font-size:' + fontSize + 'px !important}';
				}

				styleHTML += '</style>';
				var html = '<div id="container">' + styleHTML + '<h2 style="text-align:center;margin-bottom:12px">' + (name)  + '</h2>' + table.outerHTML + '<div style="text-align:center;margin-top:15px;font-weight:bold;font-size:1.1em">Row Count: ' + resData.length + '</div></div>';

				// document.body.insertAdjacentHTML('beforeend', html);

				// var printWindow = window.open();
				// printWindow.document.body.innerHTML = html;

				// self.setState({
	    		// loaderArr: self.getLoaderArr({id: 'generateCompleteReport'}, 'delete')
	    		// })
				// return;


				ServerAPI.getPDF({
		        	name: name,
		        	html: html,
		        	config: {
		        		size: config.paperSize,
			        	height: config.paperHeight,
			        	width: config.paperWidth,
			        	orientation: config.paperOrientation
			        }
		        }, function (res) {
		        	self.setState({
		        		loaderArr: self.getLoaderArr({id: 'generateCompleteReport'}, 'delete')
		        	})
		        })
			} else if (type == 'XLSX') {
				table.id = 'temp-csv-table';
				document.body.insertAdjacentHTML('beforeend', table.outerHTML);
		  		exportXLSX(document.querySelector('#temp-csv-table'), {firstRowAsHeader: true, fileType: 'xlsx', workSheetName: name, fileName: name});
				document.querySelector('#temp-csv-table').remove();

				self.setState({
	        		loaderArr: self.getLoaderArr({id: 'generateCompleteReport'}, 'delete')
	        	})
			} else {
				alert('No acceptable type has been provided!');
				console.error('Type: ' + type + ' - is not acceptable!');
			}

			// console.log(res);
			// console.log(newFrag);
		})
	}

	loadAjaxFields (callBack) {
		var self = this;
		var stateObj = this.state;
		var moduleName = stateObj.selectedReport.ModuleName;
		var loadFields = [];
		var reportInfo = stateObj.reportInfo;

		/* ***CEM purpose */

		var filter = getURLVar('filter');
		if (filter == '0') {
			reportInfo = [];
		}


		/* ***CEM purpose (Enclosed) */

		reportInfo.map(function (item, index) {
			var DefaultList = item.DefaultList;
			if (item.Searchable == '1') {
				var DLT = item.DefaultListType; // DLT => DefaultListType 
				if (DLT == 'Checkbox') {
					var data = JSON.parse(DefaultList);
					item.DefaultList = data; // ***Please double-check if it intervenes or cause conflicts with any other existing procedure
				} else if (DLT == 'Select') {
					if (DefaultList) {
						var defaultList = DefaultList.split(',');
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
			} else {
				var DefaultList = item.DefaultList;
				if (DefaultList) {
					var defaultList = DefaultList.split(',');
					if (item.Type == 'date') {
						if (defaultList[0] == 'range') {
							item.DateRange = true;
							return;
						}
					}
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
				},
				where: {
					[field]: {
						$ne: ''
					}
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
	}

	getCascadedFieldValues (field, cascader, cascaderValue) {
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
	}

	render_dateTypeFilter (item) {
		var self = this;
		var stateObj = this.state;

		var type = item.dateType;
		var yearValues = item.yearValues || years;

		var yearOptions = [];

    	yearOptions.push({
			value: '__clear_all__',
			label: 'All',
			style: {
				color: 'white', 
				backgroundColor: '#4779ac'
			}
		});

		yearValues.map(function (item) {
			yearOptions.push({
				value: item,
				label: item
			})
		});

		if (type == "Month") {
			var monthOptions = [];
			monthOptions.push({
				value: '__clear_all__',
				label: 'All',
				style: {
					color: 'white', 
					backgroundColor: '#4779ac'
				}
			});

			months.map(function (item) {
    			monthOptions.push({
    				value: item.value,
    				label: item.label
    			})
    		});    		

    		// <MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
        	// {/*<MenuItem value={'__clear_all__'} primaryText={'Clear Item'} style={{color: 'white', backgroundColor: '#8b5656'}} />*/}
        	// {months.map(function (item, index) {
        	//	return (
        	//		<MenuItem key={index} value={item.value} primaryText={item.label} />
        	//	);
        	// })}

        	// <MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
        	// {yearValues.map(function (item, index) {
        		// return (
        			// <MenuItem key={index} value={item} primaryText={item} />
        		// );
        	// })}

			return (
				<div style={{position: 'relative'}}>
					
					<SelectField
			        	floatingLabelText="Month"
			          	value={item.month}
			          	onChange={this._onSelectFieldChange.bind(this, {key: 'month', item: item})}
			          	style={selectDefaultStyle}
			          	multiple
		          		// selectedMenuItemStyle={{color: 'rgb(125, 190, 125)', backgroundColor: 'rgb(71, 172, 121)'}} 
		          		options={monthOptions}
			        >
			        	{/* See above the return line to get previous code, 1st portion */}
			        </SelectField>

			        <SelectField
			        	floatingLabelText="Year"
			          	value={item.year}
			          	onChange={this._onSelectFieldChange.bind(this, {key: 'year', item: item})}
			          	style={selectDefaultStyle}
			          	multiple
		          		// selectedMenuItemStyle={{color: 'rgb(125, 190, 125)', backgroundColor: 'rgb(71, 172, 121)'}} 
		          		options={yearOptions}
			        >
			        	{/* See above the return line to get previous code, 2nd portion */}
			        	
			        </SelectField>
				</div>
			);
		} else if (type == "Quarter") {

			var quarterOptions = [];
			quarterOptions.push({
				value: '__clear_all__',
				label: 'All',
				style: {
					color: 'white', 
					backgroundColor: '#4779ac'
				}
			});

			quarters.map(function (item) {
    			quarterOptions.push({
    				value: item.value,
    				label: item.label
    			})
    		}); 

    		// <MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
        	// {/*<MenuItem value={'__clear_all__'} primaryText={'Clear Item'} style={{color: 'white', backgroundColor: '#8b5656'}} />*/}
        	// {quarters.map(function (item, index) {
        		// return (
        			// <MenuItem key={index} value={item.value} primaryText={item.label} />
        		// );
        	// })}

    		// <MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
        	// {yearValues.map(function (item, index) {
        		// return (
        			// <MenuItem key={index} value={item} primaryText={item} />
        		// );
        	// })}

			return (
				<div>
					<SelectField
			        	floatingLabelText="Quarter"
			          	value={item.quarter}
			          	onChange={this._onSelectFieldChange.bind(this, {key: 'quarter', item: item})}
			          	style={selectDefaultStyle}
			          	multiple
		          		// selectedMenuItemStyle={{color: 'rgb(125, 190, 125)', backgroundColor: 'rgb(71, 172, 121)'}} 
		          		options={quarterOptions}
			        >
			        	{/* See above the return line to get previous code, 1st portion */}
			        </SelectField>

			        <SelectField
			        	floatingLabelText="Year"
			          	value={item.year}
			          	onChange={this._onSelectFieldChange.bind(this, {key: 'year', item: item})}
			          	style={selectDefaultStyle}
			          	multiple
		          		// selectedMenuItemStyle={{color: 'rgb(125, 190, 125)', backgroundColor: 'rgb(71, 172, 121)'}} 
		          		options={yearOptions}
			        >
			        	{/* See above the return line to get previous code, 2nd portion */}
			        </SelectField>
				</div>
			);
		} else if (type == "Year") {

			// <MenuItem value={"__clear_all__"} primaryText={'All'} style={{color: 'white', backgroundColor: '#4779ac'}}/>
        	// {/*<MenuItem value={'__clear_all__'} primaryText={'Clear Item'} style={{color: 'white', backgroundColor: '#8b5656'}} />*/}
        	// {yearValues.map(function (item, index) {
        		// return (
        			// <MenuItem key={index} value={item} primaryText={item} />
        		// );
        	// })}

			return (
				<div>
			        <SelectField
			        	floatingLabelText="Year"
			          	value={item.year}
			          	onChange={this._onSelectFieldChange.bind(this, {key: 'year', item: item})}
			          	style={selectDefaultStyle}
			          	multiple
		          		// selectedMenuItemStyle={{color: 'rgb(125, 190, 125)', backgroundColor: 'rgb(71, 172, 121)'}} 
		          		options={yearOptions}
			        >
			        	{/* See above the return line to get previous code, 1st portion */}
			        </SelectField>
				</div>
			);
		}
		return null;
	}

	initializeReportKeys () {
		return {
			filterValues: {},
    		excludedFields: {},
    		ajaxFieldValues: {},
    		dateTypeFieldValues: {},
    		checkBoxValues: {},
    		cascadeFields: {},
    		shareWithValues: {},
    		loadedStructures: [],
    		reportInfo: [],
    		additionalData: null,
    		selectedFields: {}
		}
	}

	_showExportModal () {
        this.setState({
        	exportModalView: true
        })
	}

	_closeExportModal () {
		this.setState({
        	exportModalView: false
        })
	}

	_exportReport () {
		var data = this.refs['export-comp'].getData();

		var type = data.reportType;

		if (type != 'XLSX' && type != 'PDF') {
			ActionCreator.setModalData({
				viewMode: true,
				messageNode: 'Please select a type'
			})
			return;
		}

		var selectArr = [];
		var fields = data.fields;
		Object.keys(fields).map((i) => {
			var item = fields[i];
			if (item.selected === true) {
				selectArr.push(item.fieldName);
			}
		})

		if (!selectArr.length) {
			ActionCreator.setModalData({
				viewMode: true,
				messageNode: 'Please select at lease 1 Field!'
			})
			return;
		}

		var {paperSize, paperOrientation, paperWidth, paperHeight} = data;
		var message = null;
		if (type == 'PDF') {
			if (!paperSize) {
				message = 'Please select the paper size!';
			} else if (paperSize == 'Custom') {
				if (!paperWidth) {
					message = 'Please define the width of the paper!';
				} else if (isNaN(parseFloat(paperWidth))) {
					message = 'Please provide a number in the width field!';
				} else if (!paperHeight) {
					message = 'Please define the height of the paper!';
				} else if (isNaN(parseFloat(paperHeight))) {
					message = 'Please provide a number in the height field!';
				} else if (!paperOrientation) {
					message = 'Please select orientation of the paper!';
				}
			}
		}

		if (message) {
			ActionCreator.setModalData({
				viewMode: true,
				messageNode: message
			})
			return;
		}
		// console.log(selectArr);

  		// this.refs['scroll-pos'].scrollIntoView({behavior: 'smooth'});
  		this.refs['scroll-pos'].scrollIntoView();

		this.setState({
			exportModalView: false
		}, function () {
			this._generateCompleteReport(type, {select: selectArr}, {
				name: data.reportTitle,
				paperSize: paperSize,
				paperOrientation: paperOrientation,
				paperWidth: paperWidth,
				paperHeight: paperHeight,
				columnDivider: data.columnDivider,
				rowDivider: data.rowDivider,
				alternateRowColor: data.alternateRowColor,
				tableCondensed: data.tableCondensed,
				fontSize: data.fontSize
			});
		})

		// console.log('Export Configuration', data);
	}

	_applyStickyColumns () {
		var stateObj = this.state;
		var val = parseInt(document.all['sticky-columns'].value);
		if (!isNaN(val) && val != stateObj.stickyColumns) {
			stateObj.stickyColumns = val;
			this.setState({
				stickyColumns: val
			}, function () {
				this.refs['table'].update({
					stickyColumns: val
				});
			})
		}
	}

	render () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;
		var reports = stateObj.reports;
		var selectedReport = stateObj.selectedReport || {};
		var reportInfo = stateObj.reportInfo;
		var filterValues = stateObj.filterValues;
		var excludedFields = stateObj.excludedFields;
		var checkBoxValues = stateObj.checkBoxValues;
		var activeTab = stateObj.activeTab;
		var TABS = this.__tabs;

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
			var response = null;
			if (item.DefaultListType == 'Checkbox') {
				var defaultList = item.DefaultList;
				if (typeof defaultList == 'string') return  null;
				var FN = item.FieldName;
				var checkBoxValue = checkBoxValues[FN] || {};
				response = (
					<div style={{marginTop: '10px'}}>
						<label>{item.Name}</label>
						{defaultList.map((i) => {
							var label = i.l; // `l` contains the label of the check-box item, it is stored in the database, and using `l` is to faciliate saving volume
							return (
								<Checkbox
									key={label}
						        	label={label}
						        	checked={checkBoxValue[label] ? true : false}
						          	onCheck={() => {
						          		var ps = checkBoxValue[label]; // ps => previous state of the Checkbox 
						          		if (ps) {
							          		delete checkBoxValues[FN][label];
							          	} else {
							          		if (!(FN in checkBoxValues)) checkBoxValues[FN] = {};
							          		checkBoxValues[FN][label] = true;
							          	}
							          	self.forceUpdate();
						          	}}
						        />
							);
						})}
					</div>
				);
			} else if (item.Fetch == '1' || item.DefaultList || item.CascadeField) { // Considering all other items with non-empty DefaultList values as of `Select` type
				var options = [];
				var cascadeField = stateObj.cascadeFields[item.FieldName]; 
				options.push({
					value: '__clear_all__',
					label: cascadeField ? 'Clear Item' : 'All',
					style: {
						color: 'white', 
						backgroundColor: cascadeField ? '#8b5656' : '#6e98a9'
						// backgroundColor: cascadeField ? '#8b5656' : '#4779ac'
					}
				});

				var rawOptions = stateObj.ajaxFieldValues[item.FieldName] || [];

				rawOptions.map(function (item) {
        			options.push({
        				value: item,
        				label: item
        			})
        		});

				response = (
					<SelectField
			        	floatingLabelText={item.Name}
				      	value={filterValues[item.FieldName] || ""}
			          	onChange={self._onSelectFieldChange.bind(self, item.FieldName)}
				        style={selectDefaultStyle}
          				multiple={cascadeField ? false : true}
	          			// selectedMenuItemStyle={{color: 'rgb(125, 190, 125)', backgroundColor: 'rgb(71, 172, 121)'}} 
	          			options={options}
			        />
			    );
			} else {
				response = (
			        <TextField
				        style={selectDefaultStyle}
				      	floatingLabelText={item.Name}
				      	value={filterValues[item.FieldName] || ""}
				      	onChange={self._onTextFieldChange.bind(self, item.FieldName)}
				    />
				);
			}

			return response;
		}

		/* ***CEM purpose */

		// var reportName = decodeURIComponent(getURLVar('name'));
		var Did = getURLVar('Did');
		var excFields = getURLVar('exc_fields') == '0' ? false : true;
		var filter = getURLVar('filter') == '0' ? false : true;
		var rowEditable = getURLVar('row_editable') == '1' ? true : false;
		var downloadable = getURLVar('downloadable') == '1' ? true : false;
		// if (reportName) {
		if (Did) {
			reports = [];
			if (!filter) {
				reportInfo.map(function (item, index) {
					item.Searchable = '0';
				})
			}
		}

		/* ***CEM purpose (Enclosed) */

		var summationData = stateObj.summationData;
		var summationDataLen = summationData && summationData.length;

		var tableData = stateObj.tableData;
		var headers = tableData && tableData.headers;
		var showTable = tableData && stateObj.tableDataLoaded;
		var showFilterBtn = false;

		var utilityLoaded = stateObj.utilityLoaded;

		var exportModalView = stateObj.exportModalView;

		var s_ReportName = getURLVar('custom_name') || selectedReport.Name; // Selected Report Name

		return (
			<div ref="container" style={{maxWidth: '1200px', margin: 'auto'}} className={"coi-report"}>
				<div ref='scroll-pos'/>
				{/*<PremisePanel
					panelName={s_ReportName || "Report Portal"}
					bodyStyle={{
						overflow: 'visible',
						//maxWidth: '1200px',
						//margin: 'auto'
					}}
				>*/}
					{props.header || <div className="page-heading"><div className="header-font-size">{s_ReportName || "Report Portal"}</div></div>}
					{/*<TopLoader data={stateObj.loaderArr} style={{zIndex: '1'}}/>*/}

					{TABS.length > 1 ? 
						<div className="nav nav-tabs" style={{marginBottom: '10px'}}>
							{TABS.map(function (item, index) {
								var value = item.value;
								return (
									<li key={value} className={activeTab == value ? 'active' : null} onClick={self._changeTab.bind(self, value)}>
										<a>{value}</a>
									</li>
								);
							})}
						</div> : null}

					{activeTab == 'Table' ?
						<div className='row'>
							{reports.length ?
								<div style={{display: 'table', margin: '0px auto 25px', position: 'relative'}}>
									{/*<SelectField
							        	floatingLabelText="Report Name"
							          	value={stateObj.selectedReport}
							          	onChange={this._onReportNameChange}
							          	style={{
							          		width: '375px',
							          		//margin: '0px auto 25px',
							          		//display: 'table'
							          	}}
						          		// selectedMenuItemStyle={{color: 'rgb(125, 190, 125)', backgroundColor: 'rgb(71, 172, 121)'}} 
							        >
							        	{reports.map(function (item, index) {
							        		return (
							        			<MenuItem key={index} value={item} primaryText={item.Name} />
							        		);
							        	})}
							        </SelectField>*/}
							    	{/* ****Above portion commented out for now, needs to be implemented */}

							        {filter && s_ReportName && false ? // ****Returning false forcibly for now, needs to be implemented 
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

							        {filter && s_ReportName && false ? // ****Returning false forcibly for now, needs to be implemented 
										// <div style={{display: 'inline-block', margin: '0px 10px', verticalAlign: 'bottom', height: '60px', position: 'absolute', top: '75px', left: '100%'}}>
										<div style={{display: 'inline-block', margin: '0px 10px', verticalAlign: 'bottom', }}>
							        		<MenuItem 
							        			primaryText={<div onClick={this._loadReportStructureNames} style={{textDecoration: 'underline'}}>Load Filters</div>}
							        			rightIcon={<ArrowDropRight style={{fill: "#aaa"}}/>}
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

							{(filter || null) && reportInfo.map(function (item, index) {
								mappedName[item.FieldName] = item.Name;
								if (item.Searchable != '1') return null;
								showFilterBtn = true;

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
													// return null; // ****Returning null for now, needs to implemented
													
													return (
														<div 
															// style={selectDefaultStyle}
															style={Object.assign({}, selectDefaultStyle, {
																overflow: null
															})}
															>
															{/*<div style={{fontSize: '12px', fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.3)', marginTop: '3px'}}>{item.Name}</div>*/}
															<label>{item.Name}</label>
															{/*<div className="col-sm-6" style={{position: 'relative', overflow: 'hidden'}}>*/}
															<div className='row'>
																<div className="col-sm-6" style={{position: 'relative'}}>
																	<DatePicker 
																		className="form-control"
																		selected={dateItem.dateFrom ? dateItem.moment_dateFrom : null} 
																		// hintText="From" 
																		// container="inline" 
																		placeholderText="Start Date"
																		showYearDropdown
																		showMonthDropdown
																		isClearable
																		id={'start-date-' + item.FieldName} 
																		onChange={(md) => { // md => moment-date
																			dateItem.moment_dateFrom = md;
																			dateItem.dateFrom = md ? md._d.getTime() : null;
																			self.forceUpdate();
																		}}/>
																		{/*dateItem.dateFrom ?
																			<span 
																				style={{position: 'absolute', right: '0px', top: '15px', cursor: 'pointer'}} 
																				onClick={() => {
																					dateItem.dateFrom = "";
																					self.forceUpdate();
																				}}>
																			</span> : null*/}
																				{/*<ClearIcon style={{height: '20px', width: '20px', fill: '#ccc'}}/>*/}
																	{/*<div style={{borderBottom: '1px solid #ccc'}}>
																</div>*/}
																</div>

																{/*<div className="col-sm-6" style={{position: 'relative', overflow: 'hidden'}}>*/}
																<div className="col-sm-6" style={{position: 'relative'}}>
																	<DatePicker 
																		className="form-control"
																		selected={dateItem.dateTo ? dateItem.moment_dateTo : null} 
																		// hintText="To" 
																		// container="inline" 
																		placeholderText="End Date"
																		showYearDropdown
																		showMonthDropdown
																		isClearable
																		id={'end-date-' + item.FieldName} 
																		onChange={(md) => {
																			dateItem.moment_dateTo = md;
																			dateItem.dateTo = md ? md._d.getTime() : null;
																			self.forceUpdate();
																		}}/>
																		{/*dateItem.dateTo ?
																			<span 
																				style={{position: 'absolute', right: '0px', top: '15px', cursor: 'pointer'}} 
																				onClick={() => {
																					dateItem.dateTo = "";
																					self.forceUpdate();
																				}}>
																			</span> : null*/}
																				{/*<ClearIcon style={{height: '20px', width: '20px', fill: '#ccc'}}/>*/}
																	{/*<div style={{borderBottom: '1px solid #ccc'}}>
																	</div>*/}
																</div>
															</div>
														</div>
													);
												}

												var value = dateItem.dateType;
												if (value == '__clear_all__') {
													value = "";
												}

												var options = [];
												options.push({
													value: '__clear_all__',
													label: 'Clear Item',
													style: {
														color: 'white', 
														// backgroundColor: '#8b5656'
														backgroundColor: '#6e98a9'
													}
												});

												dateTypeData.map(function (item) {
								        			options.push({
								        				value: item.value,
								        				label: item.label
								        			})
								        		});


												return (
													<div>
														<SelectField
												        	floatingLabelText={item.Name}
												          	value={value}
												          	// onChange={(e, index, value) => {
												          	onChange={(value) => {
												          		dateItem.dateType = value ? value.value : '';
												          		self.forceUpdate();
												          	}}
													        style={selectDefaultStyle}
										          			// selectedMenuItemStyle={{color: 'rgb(125, 190, 125)', backgroundColor: 'rgb(71, 172, 121)'}} 
										          			options={options}
												        >
											        		{/*
											        		<MenuItem value={'__clear_all__'} primaryText={'Clear Item'} style={{color: 'white', backgroundColor: '#8b5656'}} />
												        	{dateTypeData.map(function (item, index) {
												        		return (
												        			<MenuItem key={index} value={item.value} primaryText={item.label} />
												        		);
												        	})}
													        */}
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

							{filter && sharedFields.length ?
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

										var options = [];
										options.push({
											value: '__clear_all__',
											label: 'Clear Item',
											style: {
												color: 'white', 
												// backgroundColor: '#8b5656'
												backgroundColor: '#6e98a9'
											}
										});

										menuItems.map(function (item) {
						        			options.push({
						        				value: item.value,
						        				label: item.label
						        			})
						        		});

										return (
											<div key={index} className="col-sm-4">
												<SelectField
										        	floatingLabelText={placeholder}
										          	value={selectedValue == "__clear_all__" ? "" : selectedValue}
										          	// onChange={(e, index, value) => {
										          	onChange={(value) => {
										          		value = value ? value.value : '';
										          		filterValues[selectedValue] = Array.isArray(filterValues[selectedValue]) ? null : "";
										          		if (stateObj.cascadeFields[selectedValue]) {
										          			stateObj.ajaxFieldValues[stateObj.cascadeFields[selectedValue]] = [];
										          			filterValues[stateObj.cascadeFields[selectedValue]] = null;
										          		}
										          		stateObj.shareWithValues[item] = value;
										          		self.forceUpdate();
										          	}}
											        style={selectDefaultStyle}
								          			// selectedMenuItemStyle={{color: 'rgb(125, 190, 125)', backgroundColor: 'rgb(71, 172, 121)'}} 
								          			options={options}
										        />

										        {getSelect_TextField(selectedValue ? reportInfo.find((i) => i.FieldName == selectedValue) : null)}
											</div>
										);
									})}
								</div> : null
							}

							{excFields && reportInfo.length ?
								<div className="col-sm-12" style={{margin: '15px 0px 6px'}}>
									<h4 style={{textDecoration: 'underline', marginLeft: '15px'}}>Exclude Fields:</h4>

									{reportInfo.map(function (item, index) {
										if (item.Hide == '1' || item.FieldName == '__Master_Did') return null;
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
											      	console.log(e, value);
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
									: 
								null
							}

							{reportInfo.length ?
						        <div className="col-sm-12" style={{marginTop: '10px'}}>
						        	<div style={{textAlign: 'right'}}>
						        		{filter && !Did ?
							        		<RaisedButton
							        			label="Save Report Filter"
							        			labelPosition="before"
							        			onClick={this._saveReport}
							        			backgroundColor='#56a17b'
							        			labelStyle={{color: 'white'}}
							        			style={{
							        				margin: '0px 20px',
							        				border: '1px solid #19805f'
							        			}}
							        			className="btn"
										      	// icon={<BackUpIcon style={{fill: 'rgba(255, 255, 255, 0.870588)'}}/>}
										    /> : null}

						        		{/*showFilterBtn && (filter || excFields) ?*/}
						        		{(filter || excFields) ?
							        		<RaisedButton
							        			label="Filter"
							        			labelPosition="before"
							        			onClick={this._getData}
							        			backgroundColor={'rgb(87, 160, 167)'}
							        			labelStyle={{color: 'white'}}
							        			style={{
							        				margin: '0px 20px',
							        				border: '1px solid #19805f'
							        			}}
							        			className="btn"
										      	// icon={<NavigateNextIcon style={{fill: 'rgba(255, 255, 255, 0.870588)'}}/>}
										    /> : null}
						        	</div>
						        </div> : null}

							{showTable && downloadable ?
					        	<div className="col-sm-12" style={{textAlign: 'right', borderTop: '1px solid #ccc', marginTop: '15px', paddingTop: '15px', paddingBottom: '0px'}}>
					        		<RaisedButton
					        			label="Export"
					        			labelPosition="before"
					        			onClick={this._showExportModal}
					        			backgroundColor='#6ebd95'
					        			labelStyle={{color: 'white'}}
					        			style={{
					        				margin: '6px 20px',
					        				border: '1px solid #578c4e'
					        			}}
							        	className="btn"
								      	// icon={<ExportIcon style={{fill: 'rgba(255, 255, 255, 0.870588)'}}/>}
								    />

					        		{/*<button onClick={this._showExportModal} className="btn btn-default" style={{margin: '6px'}}>Export</button>*/}
					        	</div>
						        	: 
						        null
						   	}
							
								{/*<div style={{overflow: 'auto', maxHeight: '1px', position: 'absolute', opacity: '1'}}>*/}
							{showTable ?
								<div style={{overflow: 'auto', position: 'relative', clear: 'both'/*, maxHeight: '400px'*/}}>
									<div className='col-sm-12'>
										<TextField
									      	floatingLabelText={'Freeze Column'}
									      	defaultValue={'0'}
									      	id='sticky-columns'
									      	style={{
									      		maxWidth: '256px',
									      		display: 'inline-block', 
									      		marginBottom: '15px'
									      	}}
									      	// onChange={self._onTextFieldChange.bind(self, item.FieldName)}
									    />
										<button className='btn btn-default' style={{marginLeft: '15px'}} onClick={this._applyStickyColumns}>Apply</button>
									</div>

									<select 
										onChange={function (e) {
											var val = e.target.value;
											if (val != 'All') val = parseInt(val);
											self._onTableParamChange('tableLength', val);
										}}
										className="form-control"
										style={{width: '100px', marginLeft: '15px', marginBottom: '10px'}}
										value={stateObj.tableLength}>
										{[10, 25, 50, 100, 'All'].map(function (item, index) {
											return <option key={item} value={item}>{item}</option>
										})}
									</select>

									<ReactStickyTable
										ref="table"
										stickyRows={1}
										stickyColumns={stateObj.stickyColumns}
										scrollContainer={window}
										//columns={this.__tempColumns}
										columns={stateObj.stickyTableHeaders}
										//data={this.__temp}
										// data={stateObj.stickyTableData}
										data={stateObj.stickyTableData}
										sortingIndex={stateObj.sortingIndex}
										sortingOrder={stateObj.sortingOrder}
										pageNumber={stateObj.pageNumber}
										tableLength={stateObj.tableLength}
										totalRows={stateObj.totalRows}
										// tableContainerMaxHeight={500}
										settings={{
											search: false,
											tableLength: false,
											pagination: true,
											information: true
										}}
										colResizable
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
										movingScroller={movingScroller}
										style={{
											padding: '0px 12px',
											clear: 'both'
										}}
										additionalData={stateObj.additionalData}
										// afterTableNode={stateObj.summationData ? (
										// 	<div style={{padding: '6px'}}>
										// 		<label>Summation (of {stateObj.stickyTableData.length} rows)</label>
										// 		<Paper
										// 			zDepth={2}
										// 			>
        		// 									{summationData.map(function (item, index) {
        		// 										var returnArr = <MenuItem key={'Menu-' + item.label} primaryText={item.label + " - " + item.value} />;
        		// 										if (summationDataLen != index + 1) {
        		// 											returnArr = [
        		// 												returnArr,
        		// 												<Divider key={'Divider-' + index} />
        		// 											]
        		// 										}
        		// 										return returnArr;
        		// 									})}
										// 		</Paper>
										// 	</div>
										// ) : null}
										/>
								</div> : null
							}
						</div> :
						<ChartGenerator />
					}
					<div>
						<Modal
				        	open={exportModalView ? true : false}
				        	onHideRequest={this._closeExportModal}
				        	>
				        	{exportModalView ?
					        	<div style={{minWidth: window.innerWidth * .6 + 'px'}}>
						        	<ExportModal ref='export-comp' Did={selectedReport.Did} reportInfo={reportInfo} excludedFields={excludedFields}/>
						        	<div style={{textAlign: 'right', marginRight: '15px'}}>
						        		<RaisedButton
									        label="Cancel"
									        backgroundColor="#fff"
									        labelStyle={{
									        	color: '#00bcd4'
									        }}
									        style={{
									        	boxShadow: 'none'
									        }}
									        hoverStyle={{
									        	backgroundColor: '#eee'
									        }}
									        onClick={this._closeExportModal}
								      	/>
								      	<RaisedButton
									        label="Submit"
									        backgroundColor="#fff"
									        labelStyle={{
									        	color: '#00bcd4'
									        }}
									        style={{
									        	boxShadow: 'none'
									        }}
									        hoverStyle={{
									        	backgroundColor: '#eee'
									        }}
									        keyboardFocused={true}
									        onClick={this._exportReport}
								      	/>
						        	</div>
						        </div>
						        	:
						        <div style={{backgroundColor: 'white', width: '768px'}}>

						        </div>
						    }
				        </Modal>
					</div>
				{/*
				</PremisePanel>
				*/}
			</div>
		)
	}
}
