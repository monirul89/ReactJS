var React = require('react');

var constructSearchData = function (data) {
	var searchData = [];
	var pushSearchData = function (listPos, prevLabel, parent, item, index) {
		if (parent) {
			item.__parent = parent;
		} else {
			item.__parent = data;
			item.__firstGen = true;
		}

		item.__index = index;

		var currentLabel = prevLabel ? (prevLabel + " -> " + "\'" + item.label + "\'") : ("'" + item.label + "'");
		searchData.push({__index: index, label: item.label, cumulativeLabel: currentLabel, value: item.value, __parent: item.__parent, __firstGen: item.__firstGen || false});
		if (item.list) {
			item.list.map(pushSearchData.bind(this, listPos + "-" + index, currentLabel, item));
		}
	}
	data.map(pushSearchData.bind(this, 0, "", false));
	return searchData;
}

var getSelectedObj = function (item) {
	var selectedObj = [];
	var currentObj = item;

	while (currentObj.__firstGen !== true) {
		var newObj = {};
		newObj.label = currentObj.label;
		newObj.value = currentObj.value;
		selectedObj.push(newObj);
		currentObj = currentObj.__parent;
	}

	selectedObj.push({label: currentObj.label, value: currentObj.value});
	selectedObj.reverse();
	return selectedObj;
}

var nextIcon = (
	<svg 
		xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" style={{fill: '#4577cc'}}>
		<path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.218 19l-1.782-1.75 5.25-5.25-5.25-5.25 1.782-1.75 6.968 7-6.968 7z"></path>
	</svg>
);

var getNodeFromRef = function (ref) {
	var node = ref;
	if (!node.nodeName) {
		node = React.findDOMNode(node);
		if (!node.nodeName) {
			node = node.getDOMNode();
		}
	}
	return node;
}

var DrillDown = React.createClass({
	extractValue: function (val) {
		var searchObj = {};
		if (val) {
			if (Array.isArray(val) && val.length) searchObj = val[val.length - 1];
			else if (typeof val == 'object') searchObj = val;
			else {
				searchObj = {label: "", value: val};
			}
		}
		return searchObj;
	},

	autoChange: function (val) {
		this.setState(Object.assign({}, this.getSearchState(this.findObj(this.extractValue(val)))));
	},

	findObj: function (findItem, searchData) {
		if (!findItem) return {};
		searchData = searchData || this.state.searchData;
		return searchData.find(function (item) {
			if (findItem.value === item.value) {
				return true;
			}
		}) || {};
	},

	getSearchState: function (searchObj, searchData) {
		var stateObj = this.state || {};
		var stateSetter = {};
		searchData = searchData || stateObj.searchData;
		if (searchObj && Object.keys(searchObj).length) {
			if (searchObj.__firstGen === true) {
				stateSetter.selectedList = searchObj.__parent;
			} else {
				stateSetter.selectedList = searchObj.__parent.list;
			}
			stateSetter.selectedIndex = searchObj.__index;
		} else if (searchData && searchData.length) {
			stateSetter.selectedList = searchData[0].__parent;
			stateSetter.selectedIndex = -1;
		}
		stateSetter[stateObj.searchMode ? 'searchObj' : 'valueObj'] = searchObj || null;
		return stateSetter;
	},

	getInitialState: function () {
		var props = this.props;
		var newData = JSON.parse(JSON.stringify(props.data));
		var searchData = constructSearchData(newData);

		if (!document.head.querySelector('[data-component-name=DrillDown]')) {
			var newStyleSheet = document.createElement('style');
			newStyleSheet.type = "text/css";
			newStyleSheet.rel = "stylesheet";
			newStyleSheet.innerHTML = '.drilldown-list-group{padding-left:0;margin-bottom:20px;cursor:pointer}.drilldown-list-group-item{position:relative;display:block;padding:5px 15px;margin-bottom:-1px;background-color:#fff;border:1px solid #ddd}.drilldown-list-group-item:last-child{margin-bottom:0px;}.drilldown-list-group-item:hover>div>span>svg{fill:white !important;}.drilldown-list-group-item:hover{background-color:rgb(126, 165, 183)!important;color:white;}.drilldown-input{box-sizing:border-box;display:block;width:100%;height:34px;padding:6px 12px;font-size:14px;line-height:1.42857143;color:#555;background-color:#fff;background-image:none;border:1px solid #ccc;border-radius:4px;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);box-shadow:inset 0 1px 1px rgba(0,0,0,.075);-webkit-transition:border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;-o-transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s;transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s}.drilldown-input:focus{border-color:#66afe9;outline:0;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6)}';
			newStyleSheet.dataset.componentName = "DrillDown";
			document.head.appendChild(newStyleSheet);
		}

		this._updater = props.onChange || this.autoChange;

		this.controlledDataUpdate = props.controlledDataUpdate === true ? true : false;

		this.foundObjectCount = 0;
		this.foundObject = {};
		this.denyUpdate = false;

		var stateSetter = {
			status: false,
			searchData: searchData,
			searchMode: false,
			searchObj: {},
			valueObj: {},
			selectedList: newData,
			selectedIndex: -1
		};

		Object.assign(stateSetter, this.getSearchState(this.findObj(this.extractValue(props.value), searchData), searchData));
		return stateSetter;
	},

	shouldComponentUpdate: function () {
		if (this.denyUpdate) {
			this.denyUpdate = false;
			return false;
		} else return true;
	},

	_handleKeyPress: function (e) {
		if (e.which == 27) {
			this.setState({searchMode: false, status: false});
			return;
		}

		var stateObj = this.state;
		var targetObj = e.target;

		if (stateObj.searchMode === true) {
			if (e.which != 40 && e.which != 38 && e.which != 13) return;
			if (e.target.nodeName == "INPUT") e.target.nextElementSibling.focus();
			if (e.which == 38) {
				var selectedIndex = stateObj.selectedIndex;
				if (selectedIndex < 1) {
					selectedIndex = 0;
					var inputBox = getNodeFromRef(this.refs['drilldown-search-input']);
					inputBox.focus();
				}
				this.setState({selectedIndex: selectedIndex - 1});
			} else if (e.which == 40) {
				var selectedIndex = this.state.selectedIndex;
				//getNodeFromRef(this.refs['drilldown-search-input']).focus();
				this.setState({selectedIndex: selectedIndex + 1});
			} else if (e.which == 13) {
				var inputBox = getNodeFromRef(this.refs['drilldown-search-input']);
				inputBox.parentNode.lastElementChild.children[stateObj.selectedIndex].click();
			} else return;
			//e.preventDefault();
			return;
		}

		if (targetObj.nodeName == "INPUT" && (e.which != 40 && e.which != 38)) return;
		if (stateObj.status !== true) {
			this.setState({status: true});
			return;
		}
		if (targetObj.nodeName == "INPUT") targetObj.nextElementSibling.focus();
		if (e.which == 37) {
			var parent = stateObj.selectedList[0].__parent;
			if (parent) {
				if (parent.__firstGen === true) {
					var selectedList = parent.__parent;
					var selectedIndex = parent.__index;
					var searchObj = selectedList[selectedIndex];
					searchObj = getSelectedObj(searchObj);
					this._updater(searchObj);
				} else {
					if (Array.isArray(parent)) return;
					var selectedList = parent.__parent.list;
					var selectedIndex = parent.__index;
					var searchObj = selectedList[selectedIndex];
					searchObj = getSelectedObj(searchObj);
					this._updater(searchObj);
				}
			}
		} else if (e.which == 38) {
			var selectedIndex = this.state.selectedIndex;
			if (!selectedIndex) {
				var inputBox = getNodeFromRef(this.refs['drilldown-search-input']);
				inputBox.focus();
				return;
			}
			var searchObj = this.state.selectedList[selectedIndex - 1];
			searchObj = getSelectedObj(searchObj);
			this._updater(searchObj);
		} else if (e.which == 39) {
			var selectedIndex = this.state.selectedIndex;
			var selectedList = this.state.selectedList[selectedIndex];
			if (!selectedList) return;
			selectedList = selectedList.list;
			if (!selectedList || !selectedList.length) return;
			var searchObj = selectedList[0];
			searchObj = getSelectedObj(searchObj);
			this._updater(searchObj);
		} else if (e.which == 40) {
			var selectedIndex = this.state.selectedIndex;
			var searchObj = this.state.selectedList[selectedIndex + 1];
			if (!searchObj) return;
			//getNodeFromRef(this.refs['drilldown-search-input']).focus();
			searchObj = getSelectedObj(searchObj);
			this._updater(searchObj);
		}
	},

	_checkOutOfBoundClick: function (e) {
		var containerObj = getNodeFromRef(this.refs['container']);

		if (this.state.status === true || this.state.searchMode === true) {
			if (containerObj.contains(e.target) != true) {
				this.setState({status: false, searchMode: false});
			}
		}
	},

	componentWillReceiveProps: function (nextProps) {
		var stateSetter = {};
		if (!this.controlledDataUpdate) {
			var searchObj = this.extractValue(nextProps.value);

			stateSetter.searchObj = searchObj;
			var searchData = [];

			var newStringifiedData = JSON.stringify(nextProps.data);
			var newData = null;

			if (!this.controlledDataUpdate && JSON.stringify(this.props.data) != newStringifiedData) {
				newData = JSON.parse(newStringifiedData);
				searchData = stateSetter.searchData = constructSearchData(newData);
			} else {
				searchData = this.state.searchData;
			}

			Object.assign(stateSetter, this.getSearchState(this.findObj(searchObj, searchData), searchData));
		} else {
			//this.denyUpdate = true;
		}
		this.setState(stateSetter);
	},

	_setValue: function (item, e) {
		this._updater.call(this, getSelectedObj(item));
		e.stopPropagation();
	},

	_toggleStatus: function (e) {
		var currentStatus = this.state.status;
		if (currentStatus === true) {
			if (e.currentTarget.contains(document.activeElement) != true) {
				this.setState({status: false});
			}
		} else {
			this.setState({status: true});
		}
	},

	_changeSearchObj: function (e) {
		var self = this;
		var searchValue = e.target.value, searchMode = true;
		var searchObj = {};
		var stateSetter = {};
		if (!searchValue) {
			searchMode = false;
			stateSetter.valueObj = {};
		};

		stateSetter.searchObj = searchObj = {label: searchValue};
		stateSetter.searchMode = searchMode;

		this.setState(stateSetter, function () {
			if (!searchMode) self._updater();
		})
	},

	_showSpecificItem: function (item, e) {
		this.setState({
			searchMode: false,
		}, function () {
			getNodeFromRef(this.refs['drilldown-search-input']).nextElementSibling.focus();
			this._updater.call(this, [{label: item.label, value: item.value}]);
		});
	},

	componentDidUpdate: function (prevProps, prevState) {
		var stateObj = this.state;
		if (prevState.searchObj.label == stateObj.searchObj.label) {
			if (this.state.searchMode && stateObj.selectedIndex > this.foundObjectCount) stateObj.selectedIndex--;
			return;
		}
		if (this.foundObjectCount == 1) {
			if (stateObj.searchObj.label.toLowerCase() == this.foundObject.label.toLowerCase()) {
				var foundObject = this.foundObject;
				this._showSpecificItem.call(this, foundObject);
			}
		}
	},

	componentDidMount: function () {
		window.addEventListener('click', this._checkOutOfBoundClick);
	},

	componentWillUnmount: function () {
		window.removeEventListener('click', this._checkOutOfBoundClick);
	},

	_selectList: function (item, e) {
		this.setState({selectedList: item.list}); 
		e.stopPropagation();
	},

	render: function () {
		var self = this;
		var stateObj = this.state;
		var data = stateObj.selectedList;
		var searchMode = stateObj.searchMode;
		var searchValue = searchMode ? stateObj.searchObj.label : stateObj.valueObj.label;
		var lowerCaseSearchValue = searchValue ? searchValue.toLowerCase() : searchValue;

		var generateNestedItem = function (item, index) {
			var nestedIndicator = null, onClickFunc = null;
			
			onClickFunc = self._setValue.bind(self, item);

			if (Array.isArray(item.list) && item.list.length) {
				nestedIndicator = 
					<span 
						onClick={self._selectList.bind(self, item)} 
						key="1" 
						style={{position: 'absolute', right: '-12px', top: '2px', color: '#456a8f', fontSize: '16px', fontWeight: 'bold'}} >
						{nextIcon}
					</span>
				;
			}

			var listStyle = {minWidth: '60px', lineHeight: '25px', outline: 'none'};
			if (item.label.toLowerCase() == lowerCaseSearchValue) listStyle.backgroundColor = 'rgb(236, 252, 247)';

			return (
				<li key={index} className="drilldown-list-group-item" onClick={onClickFunc} style={listStyle}>
					<div data-value={item.value} style={{position: 'relative'}}>{item.label}{nestedIndicator}</div>
				</li>
			);
		}

		self.foundObjectCount = 0;
		self.foundObject = {};

		var generateFilteredList = function (item, index) {
			if (item.label.toLowerCase().search(lowerCaseSearchValue) > -1) {
				if (!self.foundObjectCount) {
					self.foundObject = item;
				}
				self.foundObjectCount++;

				var listStyle = {outline: 'none'};
				if (self.foundObjectCount == stateObj.selectedIndex + 1) {
					listStyle.backgroundColor = 'rgb(236, 252, 247)';
				}

				return	<li key={index} tabIndex="-1" onClick={self._showSpecificItem.bind(self, item)} className="drilldown-list-group-item" style={listStyle}>{item.cumulativeLabel}</li>
			} else return null;
		}

		return (
			<div drilldown ref="container" tabIndex="-1" onFocus={this._toggleStatus} onKeyDown={this._handleKeyPress} style={{outline: 'none', width: '100%', overflowX: 'visible', position: 'relative'}}>
				<input ref="drilldown-search-input" className="drilldown-input" onChange={this._changeSearchObj} value={searchValue}></input>
				<div tabIndex="-2" dummyElement style={{opacity: '0'}}></div>
				{stateObj.searchMode ? 
					<ul className="drilldown-list-group" style={{outline: 'none', maxHeight: '600px', overflowY: 'auto', position: 'absolute', width: '100%', zIndex: 4}}>{stateObj.searchData.map(generateFilteredList)}</ul>
						:
					<ul className="drilldown-list-group" style={{outline: 'none', display: this.state.status === true ? "" : "none", position: 'absolute', width: '100%', zIndex: 4}}>
						{data.map(generateNestedItem.bind(this))}
					</ul>
				}
			</div>
		)
	}
});

module.exports = DrillDown;

