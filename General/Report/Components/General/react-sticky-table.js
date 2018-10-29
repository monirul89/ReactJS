import React, { Component } from 'react';

var macOS = navigator.userAgent.indexOf('Mac OS X') != -1 ? true : false;

var stickerTransition = 'margin-top .1s cubic-bezier(0.7, 0.13, 0.2, 1)';

class RowChild extends Component {
	componentDidMount () {
		var node = this.refs['node-container'];
		var offsetHeight = node.offsetHeight;
		var _s = node.style; // _s => node style object
		_s.height = '0px';
		_s.removeProperty('visibility');
		setTimeout(() => {
			_s.height = offsetHeight + 'px';
			setTimeout(() => {
				_s.removeProperty('overflow');
				_s.removeProperty('height');
			}, 200)
		})
	}

	render () {
		var props = this.props;
		return (
			<tr>
				<td
					colSpan={props.colSpan}
					style={{
						padding: '0px'
					}}
					>
					<div
						ref='node-container'
						style={{
							visibility: 'hidden',
							transition: 'height .2s linear',
							overflow: 'hidden'
						}}
						>
						{props.node}
					</div>
				</td>
			</tr>
		)
	}
}

class TableRow extends Component {
	constructor (props) {
		super(props);

		this.state = {
			item: props.item
		}

		this._onClick = this._onClick.bind(this);
		this._showDetails = this._showDetails.bind(this);
	}

	shouldComponentUpdate () {
		if (this.denyUpdate) {
			this.denyUpdate = false;
			return false;
		} else return true;
	}

	componentWillReceiveProps (nextProps) {
		if (nextProps.parentComponent.updateAllRows) {
			this.setState({item: nextProps.item});
		} else {
			this.denyUpdate = true;
		}
	}
	
	_onClick (e) {
		var props = this.props;
		props.parentComponent._rowClickHandler(props.item, props.index, props.rowConfig, e);
	}

	_showDetails (e) {
		var props = this.props;
		props.parentComponent._showRowDetails(props.item);
	}

	render () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;

		var index = props.index;
		var rowConfig = props.rowConfig;
		var parentComponent = props.parentComponent;
		var startColumn = props.startColumn;
		var endColumn = props.endColumn;
		var childCellEntrance = props.childCellEntrance;
		var firstRow = props.firstRow;
		var customWidth = props.customWidth || [];

		var rowClassName = rowConfig.className;
		var cellClickHandler = parentComponent._cellClickHandler; 
		var rowClickHandler = parentComponent._rowClickHandler;
		var parentProps = parentComponent.props;
		var item = stateObj.item;

		var style = Object.assign({}, parentProps.rowStyle || {}, rowConfig.style || {});

		var cellCollection = [];

		if (item) {
			var detachTitle = parentProps.detachAutoTitle;
			for (var columnNum = startColumn; columnNum < endColumn + 1; columnNum++) {
				var subItem = item[columnNum];
				if (!subItem) {
					cellCollection.push(<td key={'empty-' + columnNum}><b style={{visibility: 'hidden'}}>X</b></td>);
					continue;
				}

				var label = subItem.label || "";
				var labelNode = subItem.labelNode;
				var title = !detachTitle && label || null;

				var cellStyle = Object.assign({
					padding: '0px 8px', 
					whiteSpace: 'nowrap', 
					maxWidth: '100%', 
					overflow: 'hidden', 
					textOverflow: 'ellipsis'
				}, parentProps.cellStyle || {}, subItem.style || {});

				// Temporary purpose
				var parentLabel = parentProps.columns[columnNum].label || "";

				if (customWidth[columnNum]) {
					cellStyle.width = customWidth[columnNum];
				}

				cellCollection.push(
					<td 
						onClick={cellClickHandler.bind(parentComponent, subItem, columnNum, item, index)} 
						key={columnNum}
						// colSpan={subItem.colSpan || 1}
						>
						<div 
							title={title} 
							style={cellStyle}
							>
							{labelNode || label}
							{/* Temporary purpose*/}
							{firstRow && !labelNode && parentLabel.length > (label ? label.length : 0) ?
								<div style={{visibility: 'hidden', display: 'inline-block', whiteSpace: 'nowrap', marginTop: '-100%', float: 'left'}}>
									{/*parentLabel.substr(0, parentLabel.length - label.length + 2)*/}
									{parentLabel}
								</div> : null}
						</div>
					</td>
				);
					
			}
		} else {
			//rowClassName = "rs-fade-in-out";
			cellCollection.push(
				<td colSpan={endColumn - startColumn + 1 + (childCellEntrance ? 1 : 0)} key="indicator" style={{position: 'relative'}}>
					<div style={{visibility: 'hidden', position: 'relative'}}>Something to show while data is being loaded in the background.</div>
					{/*<div className="rs-fade-in-out" style={{position: 'absolute', top: '0px', left: '0px', width: '100%', height: '100%', backgroundColor: 'rgba(221, 229, 236, .5)'}}>
						<div className="box-mover" style={{position: 'absolute', top: '0px', width: '100px', height: '100%', backgroundColor: 'rgba(79, 125, 140, 0.22)'}}></div>
					</div>*/}
				</td>
			);
		}

		return (
			<tr
				className={rowClassName || null}
				style={style}
				onClick={this._onClick}
				>
				{item && childCellEntrance ? 
					(props.additionalRow ?
						<td />
							:
						<td 
							style={{width: '20px'}}
							onClick={this._showDetails}>
							<div style={{width: '20px'}}>
								<div style={{visibility: 'hidden'}}>
									*
								</div>
								<svg 
									viewBox="0 0 24 24" 
									style={{
										display: 'inline-block',
										fill: 'green', 
										height: '14px',
										width: '14px',
										transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
										userSelect: 'none',
										cursor: 'pointer',
										position: 'absolute',
										marginTop: '-17px',
										verticalAlign: 'middle'
									}}>
									<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
								</svg>
							</div>
						</td>
					)
						:
					null
				}
				{cellCollection}
			</tr>
		)
	}
};

if (process.env.NODE_ENV != 'production') {
	var totalEntered = 0; // Dev purpose	
}


export default class ReactStickyTable extends Component {
	constructor (props) {
		super(props);
		var self = this;

		this.availableTableLenOptions = {10: true, 25: true, 50: true, 100: true};

		var stateSetter = this.generateState(props);

		if (stateSetter.sortingIndex > -1 && stateSetter.sortingOrder) this.sortData(stateSetter.sortingIndex, stateSetter.sortingOrder);
		if (stateSetter.searchValue) this.filterData(stateSetter.searchValue, stateSetter.searchColumnValue);
		else this.foundRows = this.tableData.length;

		stateSetter.showRowDetailsOf = null;
		stateSetter.rowDetailsDataView = "list";
		stateSetter.expandedView = false;
		stateSetter.customWidth = [];
		this.controlledDataUpdate = props.controlledDataUpdate === true ? true : false;
		this.controlledUpdate = props.controlledUpdate === true ? true : false;

		this.__searchDivSelectView = false;
		this.denyUpdate = false;

		[
			"generateState",
			"_onValueChange",
			"filterData",
			"sortData",
			"scrollHandler",
			"resizeHandler",
			"movingScrollHandler",
			"onScrollSRTHandler",
			"_rowClickHandler",
			"_cellClickHandler",
			"update",
			"updateRow",
			"_showRowDetails",
			"_hideRowDetails",
			"_restoreUsual",
			"_expand",
			"alignCells",
			"_startColResizing"
		].map(function (fn) {
			self[fn] = self[fn].bind(self);
		})

		if (!document.head.querySelector('[data-component-name=ReactStickyTable]')) {
			var newStyleObj = document.createElement('style');
			newStyleObj.dataset.componentName = "ReactStickyTable";
			newStyleObj.innerHTML = '.row{margin-left:-15px;margin-right:-15px}.row:after,.row:before{display:table;content:" ";clear:both}@media (min-width:768px){.col-sm-3{width:25%}.col-sm-9{width:75%}.col-sm-3,.col-sm-9{float:left}.rs-column-label{padding-top:7px;margin-bottom:0;text-align:right;width:100%}}.col-sm-3,.col-sm-9{position:relative;min-height:1px;padding-right:15px;padding-left:15px}.rst-container *{box-sizing:border-box}.rs-list-view-container label{display:inline-block;max-width:100%;margin-bottom:5px;font-weight:700}.rs-table{width:100%;margin-bottom:20px;border-spacing:0;border-collapse:collapse;box-sizing:border-box;background-color:#fff}.rs-table>thead{background-color:#e4ecec}.rs-table>thead:first-child>tr:first-child>th{border-top:0;text-align:left;width:1px;vertical-align:bottom;border-bottom:2px solid #ddd}.rs-table>tbody>tr>td,.rs-table>tbody>tr>th,.rs-table>tfoot>tr>td,.rs-table>tfoot>tr>th,.rs-table>thead>tr>td,.rs-table>thead>tr>th{padding:8px;line-height:1.42857143;vertical-align:top;border-top:1px solid #ddd}.rs-table-striped>tbody>tr:nth-of-type(odd){background-color:#f3fafb}.rs-table>tbody>tr:hover{background-color:#eaf2f9}.rs-form-control{border-radius:4px;border:1px solid #ccc;height:34px;box-shadow:inset 0 1px 1px rgba(0,0,0,.075);transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s;font-family:inherit}.rs-form-control:focus{border-color:#66afe9;outline:0;box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6)}.appear-animation{animation-name:appanm;animation-duration:.38s}@keyframes appanm{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}.rs-fade-in-out{animation-name:rs_fade_in_out;animation-duration:1s;animation-iteration-count:infinite;animation-timing-function:ease-in-out;animation-direction:alternate}@keyframes rs_fade_in_out{from{opacity:.2}to{opacity:1}}';
			document.head.appendChild(newStyleObj);
			
		}

		this.state = stateSetter;
	}

	generateState (props) {
		var self = this;
		var stateObj = this.state || {};
		props = typeof props == 'undefined' ? this.props : props;

		var stickyColumns = props.stickyColumns || 0;
		var stickyRows = props.stickyRows || 0;
		if (stickyColumns < 0) stickyColumns = 0;
		if (stickyRows < 0) stickyRows = 0;
		var givenData = props.data;
		var givenDLen = givenData.length;
		var tableData = null;
		var internalTableData = null;

		var givenColumns = props.columns;
		var givenCLen = givenColumns.length;
		var stickyTableHeaders = [], scrollableTableHeaders = [];

		if (!this.controlledDataUpdate) {
			tableData = new Array(givenDLen);
			internalTableData = new Array(givenDLen);

			for (var parser = 0; parser < stickyColumns; parser++) {
				stickyTableHeaders.push(givenColumns[parser]);
			}

			for (var parser = stickyColumns; parser < givenCLen; parser++) {
				scrollableTableHeaders.push(givenColumns[parser]);
			}

			givenData.map(function (item, index) {
				tableData[index] = item;
				internalTableData[index] = item;
			})
		}

		var tableLength = props.tableLength || stateObj.tableLength;
		if (!tableLength && tableLength != 0) tableLength = 10;
		this.availableTableLenOptions[tableLength || 'All'] = true;

		var pageNumber = props.pageNumber;
		var sortingIndex = props.sortingIndex;
		var sortingOrder = props.sortingOrder;

		if (typeof pageNumber == 'undefined') {
			pageNumber = stateObj.pageNumber || 1;
		} else pageNumber = parseInt(pageNumber);

		if (typeof sortingIndex == 'undefined') {
			sortingIndex = stateObj.sortingIndex || -1;
		} else sortingIndex = parseInt(sortingIndex);

		if (typeof sortingOrder == 'undefined') {
			sortingOrder = stateObj.sortingOrder || 0;
		} else sortingOrder = parseInt(sortingOrder);

		var searchValue = props.searchValue || "";
		if (typeof searchValue != 'string') searchValue = stateObj.searchValue || "";

		var stateSetter = {
			searchValue: searchValue,
			tableLength: tableLength,
			pageNumber: pageNumber,
			sortingIndex: sortingIndex,
			sortingOrder: sortingOrder,
			searchColumnValue: props.searchColumnValue || stateObj.searchColumnValue || -1,
			additionalData: props.additionalData || []			
		}

		if (tableData) {
			this.updateAllRows = true;
			stateSetter.stickyTableHeaders = stickyTableHeaders;
			stateSetter.scrollableTableHeaders = scrollableTableHeaders;
			stateSetter.tableData = tableData;
			this.tableData = internalTableData;
			this.foundRows = givenDLen;
			stateSetter.stickyRows = stickyRows;
			stateSetter.stickyColumns = stickyColumns;
		}

		return stateSetter;
	}

	_restoreUsual () {
		this.setState({
			expandedView: false
		})
	}

	_expand () {
		var body = document.body;
		body.__RST_prevOverflow = body.style.overflow;
		body.style.overflow = "hidden";

		this.setState({
			expandedView: true
		})
	}

	componentWillReceiveProps (nextProps) {
		//if (this.controlledUpdate) {
		//	denyUpdate = true;
		//} else {
			this.setState(this.generateState(nextProps));
		//}
	}

	scrollHandler (e) {
		var refs = this.refs;
		var tableContainer = refs['table-container'];
		var stateObj = this.state;
		
		if (stateObj.stickyColumns) {
			var noDataNotifier = refs['no-data-notifier'];
			var scrollLeft = (tableContainer.scrollLeft) + "px";
			var stickyTable = refs['sticky-table'];

			var stickyWidth = noDataNotifier ? noDataNotifier.offsetWidth : stickyTable.offsetWidth;

			if (tableContainer.offsetWidth > stickyWidth + 250) {
				// stickyTable.style.left = scrollLeft;
				// if (stateObj.stickyRows) refs['sticky-table-r'].style.left = scrollLeft;

				stickyTable.style.marginLeft = scrollLeft;
				if (stateObj.stickyRows) refs['sticky-table-r'].style.marginLeft = scrollLeft;
			} else {
				// stickyTable.style.left = "0px";
				// if (stateObj.stickyRows) refs['sticky-table-r'].style.left = "0px";

				stickyTable.style.marginLeft = "0px";
				if (stateObj.stickyRows) refs['sticky-table-r'].style.marginLeft = "0px";
			}
			/*if (noDataNotifier) {
				noDataNotifier.style.marginLeft = tableContainer.scrollLeft + "px";
			}*/
		}

		if (stateObj.stickyRows) {
			if (!this.props.scrollContainer) { // *** Anything positive value present here will invoke the same operation
				var token = Math.random();
				this.__marginTopToken = token;

				setTimeout(function () {
					if (this.__marginTopToken == token) {
						this['sticky-row-table'].parentNode.parentNode.style.marginTop = tableContainer.scrollTop + "px";
					}
				}.bind(this), 300);
			}
		}

		if (this.props.movingScroller) {
			this.movingScrollHandler();
		}

	}

	resizeHandler () {
		var token = Math.random();
		this.__resizeToken = token;

		setTimeout(function () {
			if (this.__resizeToken == token) {
				this.forceUpdate();
			}
		}.bind(this), 300);
	}

	movingScrollHandler () {
		var movingScroller = this.refs['moving-scroller'];
		var rect = movingScroller.parentNode.getBoundingClientRect();
		if (rect.bottom > 400) {
			var top = rect.top;
			if (top > 0) {
				top = 0;
			}
			movingScroller.style.marginTop = -top + 'px';
			movingScroller.scrollLeft = this.refs['table-container'].scrollLeft;
		}
	}

	onScrollSRTHandler (e) {
		var self = this;
		var node = this['sticky-row-table'].parentNode.parentNode;

		var rect = node.parentNode.getBoundingClientRect();
		if (rect.bottom > 400) {
			var top = rect.top;
			if (top > 0) {
				node.style.marginTop = '0px';
			} else {
				node.style.marginTop = -top + (this.props.movingScroller ? 18 : 0) + 'px';
			}
			node.scrollLeft = this.refs['table-container'].scrollLeft;
		}
	}

	componentDidMount () {
		var self = this;
		var refs = this.refs;
		var props = this.props;
		var tableContainer = refs['table-container'];
		var stickyRows = props.stickyRows, stickyColumns = props.stickyColumns;


		/*** 

		Important Issue

		* Why is it not properly aligned when done for the first time without taking a timeout!! 
		* The upward portion which is rendered if stickyRow is enabled, can have greater cell width than its corresponding nonStickyRow collections column, so
		alignCells() though computes the cell and puts in the colgroup, these two groups of cumulative width mismatch.


		## Since we are not yet able to find the root cause of this issue, we will currently be handling this situation in quirk mode

		***/
		//setTimeout(this.alignCells, 500);
		var container = refs.container;
		container.style.opacity = '0';
		setTimeout(function () {
			self.alignCells();
			container.style.removeProperty('opacity');	
		}, 500);

		tableContainer.addEventListener('scroll', this.scrollHandler);
		if (props.movingScroller) {
			window.addEventListener('scroll', this.movingScrollHandler);
			this.movingScrollHandler();
		}
		if (stickyRows && props.scrollContainer) { // *** Any positive value present here will invoke the same operation
			window.addEventListener('scroll', this.onScrollSRTHandler);
		}
		if (!stickyColumns && !stickyRows) return;
		window.addEventListener('resize', this.resizeHandler);

		this.updateAllRows = false;

	}

	filterData (searchValue, searchColumnValue) {
		this.updateAllRows = true;
		searchValue = searchValue.toLowerCase();
		var tableData = this.state.tableData;
		var internalTableData = this.tableData;
		var internalTableDataLen = internalTableData.length;
		var foundRows = 0;

		for (var i = 0; i < internalTableDataLen; i++) {
			var item = internalTableData[i];
			if (!item) {
				foundRows++;
				return;
			}
			var found = false;
			if (searchColumnValue > -1) {
				var label = item[searchColumnValue].label || "";
				found = label.toLowerCase().search(searchValue) > -1;
			} else {
				found = item.find(function (subItem) {
					var label = subItem.label || "";
					if (label.toLowerCase().search(searchValue) > -1) return true;
				})
			}

			if (found) {
				tableData[foundRows] = item;
				foundRows++;
			} 
		}
		this.foundRows = foundRows;
	}

	sortData (sortingIndex, sortingOrder) {
		if (this.props.disableSorting === true) return;
		this.updateAllRows = true;
		if (sortingIndex < 0) return;

		/* Sorting rows according to multiple column
			var orderBy = {
			    "i2": -1,
			    "i5": 1,
			    "i3": 1
			}

			temp1.sort(function (fI, sI) {
			    var indexes = Object.keys(orderBy);
			    var parsed = 0, len = indexes.length;
			    
			    var getPos = function (index, val) {
			        index = index.substr(1);
			        if (fI[index].label > sI[index].label) {
			            return val;
			        } else if (fI[index].label < sI[index].label) {
			            return -val;
			        } else {
			            return 0;
			        }
			    }
			    
			    var pos = 0;
			    while (parsed < len) {
			        var index = indexes[parsed];
			        pos = getPos(index, orderBy[index]);
			        if (pos) {
			            break;
			        }
			        parsed++;
			    }
				
			    return pos;
			})
		*/

		this.tableData.sort(function (firstItem, secondItem) {
			if (!firstItem || !secondItem) {
				return -1;
			}

			var firstObj = firstItem[sortingIndex];
			var secondObj = secondItem[sortingIndex];
			var firstLabel = firstObj.sortValue;
			if (typeof firstLabel == 'undefined') firstLabel = firstObj.label;
			var secondLabel = secondObj.sortValue;
			if (typeof secondLabel == 'undefined') secondLabel = secondObj.label;
			if (firstLabel > secondLabel) return sortingOrder;
			else return -sortingOrder;
		})
	}

	componentWillUpdate (nextProps, nextState) {
		var self = this;
		var stateObj = this.state;
		//var tableData = stateObj.tableData;

		this.prevSortingVal = (stateObj.sortingIndex + 1) * stateObj.sortingOrder;

		var nextSortingIndex = nextState.sortingIndex, nextSortingOrder = nextState.sortingOrder;
		var nextSearchValue = nextState.searchValue, nextSearchColumnValue = nextState.searchColumnValue;
		if ((nextSortingIndex + 1) * nextSortingOrder != this.prevSortingVal) {
			this.sortData(nextSortingIndex, nextSortingOrder);
			this.filterData(nextSearchValue, nextSearchColumnValue);
		} else if (nextState.searchValue != stateObj.searchValue || nextState.searchColumnValue != stateObj.searchColumnValue) {
			this.filterData(nextSearchValue, nextSearchColumnValue);
		}

		if (nextState.stickyColumns && !stateObj.stickyColumns) {
			this.refs['table-container'].scrollLeft = 0;
		}
	}

	componentDidUpdate (prevProps, prevState) {
		if (this.state.showRowDetailsOf) return;

		var refs = this.refs;
		var tableContainer = this.refs['table-container'];

		var prevSC = prevState.stickyColumns;
		var curSC = this.state.stickyColumns;

		if (prevSC && !curSC) {
			var scrollableTable = refs['scrollable-table'];
			scrollableTable.style.marginLeft = '0px';
			scrollableTable.style.width = "100%";
			if (this.state.stickyRows) {
				var scrollableTable_r = refs['scrollable-table-r'];
				scrollableTable_r.style.marginLeft = '0px';
				// scrollableTable_r.style.minWidth = "100%";
			}
		}

		this.alignCells();

		var onUpdate = this.props.onUpdate;
		if (onUpdate) onUpdate();

		this.updateAllRows = false;

		if (prevState.stickyRows) {
			var sticker = this['sticky-row-table'].parentNode.parentNode;
			var styleObj = sticker.style;
			var stickyHeight = sticker.offsetHeight;
			var paddingTop = tableContainer.paddingTop || '0px';
			var validScrollableHeight = parseFloat(paddingTop) + this.refs['scrollable-table'].scrollHeight - stickyHeight;
			if (tableContainer.scrollTop > validScrollableHeight) {
				tableContainer.scrollTop = 0;
				tableContainer.dispatchEvent(new Event('scroll'));
			}
		}

		
	}

	alignCells () {
		//var startTime = Date.now();
		var stateObj = this.state;
		var refs = this.refs;

		if (stateObj.stickyColumns) {
			var stickyTable = refs['sticky-table'];
			var scrollableTable = refs['scrollable-table'];
			var marginLeft = stickyTable.offsetWidth + "px"; 
			scrollableTable.style.marginLeft = marginLeft;
			scrollableTable.style.width = "calc(100% - " + marginLeft + ")";
			if (stateObj.stickyRows) {
				if (marginLeft == '0px') marginLeft = refs['sticky-table-r'].offsetWidth + "px"; 
				// In case the table is empty, the offset width of simulated tbody will be zero but the simulated thead would be greater than that
				var scrollableTable_r = refs['scrollable-table-r'];
				scrollableTable_r.style.marginLeft = marginLeft;
				if (!this.props.colResizable) scrollableTable_r.style.minWidth = "calc(100% - " + marginLeft + ")";
			}
		}

		if (stateObj.stickyRows) {
			var scrollableTable_r = refs['scrollable-table-r'];
			var height = scrollableTable_r.offsetHeight;
			refs['table-container'].style.paddingTop = height + "px";
			scrollableTable_r.parentNode.style.height = height + "px";
		}

		var stickyRowComp_2 = this['sticky-row-col-table'];
		if (stickyRowComp_2) {
			var colGroup = stickyRowComp_2.firstElementChild;
			var masterTable = this['sticky-col-table'];
			var rows = masterTable.rows;
			if (rows.length) {
				var cells = rows[0].cells;
				if (cells.length == colGroup.childElementCount) {
					var cols = colGroup.children;
					var tableWidth = 0;
					for (var i = 0; i < cells.length; i++) {
						var colStyle = cols[i].style;
						var cell = cells[i];
						var cellWidth = cell.offsetWidth;
						var colWidth = colStyle.width;
						if (colWidth) colWidth = parseInt(colStyle.width);
						else colWidth = 0;
						if (colWidth != cellWidth) {
							colStyle.width = cellWidth + "px";
						}
						tableWidth += cellWidth;
					}
					stickyRowComp_2.style.width = tableWidth + "px";

					//var stickyRowTableContainer = stickyRowComp_2.parentNode.parentNode;
					//stickyRowTableContainer.style.width =  masterTable.parentNode.offsetWidth + "px";
					
				}
			} else {
				stickyRowComp_2.style.width = "100%";
			}

		}



		var stickyRowComp_2 = this['sticky-row-table'];
		if (stickyRowComp_2) {
			var colGroup = stickyRowComp_2.firstElementChild;
			var masterTable = this['master-table'];
			var rows = masterTable.rows;
			if (rows.length) {
				var cells = rows[0].cells;
				if (cells.length == colGroup.childElementCount) {
					var cols = colGroup.children;
					var tableWidth = 0;
					for (var i = 0; i < cells.length; i++) {
						var colStyle = cols[i].style;
						var cell = cells[i];
						var cellWidth = cell.offsetWidth;
						var colWidth = colStyle.width;
						if (colWidth) colWidth = parseInt(colStyle.width);
						else colWidth = 0;
						if (colWidth != cellWidth) {
							colStyle.width = cellWidth + "px";
						}
						tableWidth += cellWidth;
					}
					stickyRowComp_2.style.width = tableWidth + "px";

					//var stickyRowTableContainer = stickyRowComp_2.parentNode.parentNode;
					//stickyRowTableContainer.style.width =  masterTable.parentNode.offsetWidth + "px";
					
				}
			} else {
				stickyRowComp_2.style.width = "100%";
			}
		}

		//console.log("Time took to align the cells - " + (Date.now() - startTime) + "ms");
	}

	componentWillUnmount () {
		this.refs['table-container'].removeEventListener('scroll', this.scrollHandler);
		window.removeEventListener('resize', this.resizeHandler);
	}

	_showRowDetails (item, e) {
		var onExpandChildRequest = this.props.onExpandChildRequest.bind(null, e);
		var proceed = false;
		if (typeof onExpandChildRequest == 'undefined') {
			proceed = true;
		} else {
			proceed = onExpandChildRequest(item);
			if (proceed !== false) proceed = true;
		}

		if (proceed) {
			this.setState({
				showRowDetailsOf: item
			}, function () {
				this.refs['row-details'].focus();
			})
		}
	}

	_hideRowDetails (item) {
		var onHideChildRequest = this.props.onHideChildRequest;
		var proceed = false;
		if (typeof onHideChildRequest == 'undefined') {
			proceed = true;
		} else {
			proceed = onHideChildRequest(item);
			if (proceed !== false) proceed = true;
		}

		if (proceed) {
			var rowDetailsComp = this.refs['row-details'];
			rowDetailsComp.style.animationDirection = "reverse";
			rowDetailsComp.classList.remove('appear-animation');
			setTimeout(function () {
				rowDetailsComp.classList.add('appear-animation');
			}, 15);
			setTimeout(this.setState.bind(this, {showRowDetailsOf: null}), 360);
		}
	}

	_onValueChange (e) {
		var self = this;
		var targetObj = e.target;
		var onChangeParentCallBack = this.props.onChange;
		if (onChangeParentCallBack) onChangeParentCallBack(targetObj.name, targetObj.value, e);
		else {
			var stateSetter = {};
			stateSetter[targetObj.name] = targetObj.value;
			this.setState(stateSetter);
		}
	}

	_onSortParamChange (actualIndex, e) {
		var self = this;
		if (self.__colResizingEnabled) return;
		var stateObj = this.state;
		var key, value;
		if (stateObj.sortingIndex == actualIndex) {
			key = 'sortingOrder';
			value = (stateObj.sortingOrder - 3) % 3 + 1;
		} else {
			key = 'sortingIndex';
			value = actualIndex;
		}
		var onChangeParentCallBack = this.props.onChange;
		if (onChangeParentCallBack) onChangeParentCallBack(key, value, e);
		else {
			var stateSetter = {};
			stateSetter[key] = value;
			if (key == 'sortingIndex') stateSetter['sortingOrder'] = 1;
			this.setState(stateSetter);
		}
	}

	_startColResizing (colIndex, e) {
		var self = this;
		
		if (e.button != 0) return;
		if (self.__colResizingEnabled) {
			// self._int_click();
			return;
		}
		var mover = document.createElement('div');
		var targetObj = e.currentTarget;
		var curWidth = targetObj.parentNode.offsetWidth - 16;
		var limit = curWidth - 20;
		var diff = 0;
		var ctrl = targetObj.firstElementChild;
		ctrl.style.opacity = '.1';
		mover.style.cssText = 'border-right:2px dotted #327ba7;height:100%;top:0px;position:absolute;right:4px;';
		targetObj.appendChild(mover);

		var __startingPos = e.pageX;
		self.__colResizingEnabled = true;

		self._int_mouseMove = function (e) { // Interim stage mouse move event function
			diff = __startingPos - e.pageX;
			if (diff > limit) diff = limit; 
			mover.style.right = diff + 4 + 'px';
		}

		self._int_click = function (e) { // // Interim stage click event function
			window.removeEventListener('mousemove', self._int_mouseMove);
			window.removeEventListener('click', self._int_click);
			window.removeEventListener('contextmenu', self._int_click);
			mover.remove();
			self.state.customWidth[colIndex] = curWidth - diff;
			self.updateAllRows = true;
			ctrl.style.removeProperty('opacity');
			self.forceUpdate(() => {
				self.updateAllRows = false;
				self.__colResizingEnabled = false;
			});
		}

		window.addEventListener('mousemove', self._int_mouseMove);
		window.addEventListener('click', self._int_click);
		window.addEventListener('contextmenu', self._int_click);
	}

	_rowClickHandler (item, index, rowConfig, e) {
		var props = this.props
		if (rowConfig.onClick) rowConfig.onClick.call(this, item, index, e);
		if (props.onRowClick) props.onRowClick.call(this, item, index, e);
	}

	_cellClickHandler (item, index, rowItem, rowIndex, e) {
		var props = this.props;
		if (item.onClick) item.onClick.call(this, item, index, rowItem, rowIndex, e);
		if (props.onCellClick) props.onCellClick.call(this, item, index, rowItem, rowIndex, e);
	}

	update (props) {
		var self = this;
		var prevControlledDataUpdate = this.controlledDataUpdate;
		this.controlledDataUpdate = false;

		["searchValue", "tableLength", "pageNumber", "sortingIndex", "sortingOrder", "searchColumnValue", "stickyColumns", "stickyRows", "rowConfig", "columns", "data", "additionalData"].map(function (item, index) {if (!(item in props)) {props[item] = self.props[item];}})
		this.setState(this.generateState(props), function () {
			this.controlledDataUpdate = prevControlledDataUpdate;
		});
	}

	updateRow (props, index) {
		var rowComponent = this.refs['table-' + 't1' + '-row-' + index];
		rowComponent.setState({item: props});
		rowComponent = this.refs['table-' + 't2' + '-row-' + index];
		if (rowComponent) rowComponent.setState({item: props});
	}

	render () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;

		var rowChildren = props.rowChildren || {};

		var settings = props.settings || {};
		settings = Object.assign({information: true, pagination: true, tableLength: true, search: true, sorting: true}, settings);

		var sortingEnabled = settings.sorting ? true : false;

		var tbodyRowConfig = props.rowConfig || {};
		tbodyRowConfig = tbodyRowConfig.tbody || [];

		var scrollableTableHeaders = stateObj.scrollableTableHeaders;
		var stickyTableHeaders = stateObj.stickyTableHeaders;
		var stickyColumns = stateObj.stickyColumns;
		var stickyRows = stateObj.stickyRows;
		var tableData = stateObj.tableData;
		var tableContainerMaxHeight = parseInt
		(props.tableContainerMaxHeight);
		if (isNaN(tableContainerMaxHeight)) tableContainerMaxHeight = "auto";
		var showRowDetailsOf = stateObj.showRowDetailsOf;
		var rowDetailsDataView = stateObj.rowDetailsDataView;

		var searchValue = stateObj.searchValue, tableLength = stateObj.tableLength, searchColumnValue = parseInt(stateObj.searchColumnValue);
		if (tableLength == 'All') tableLength = 0;
		var pageNumber = stateObj.pageNumber;
		var totalPagesPossible = tableLength ? Math.ceil(tableData.length / tableLength) : 1;
		if (pageNumber > totalPagesPossible) {
			//console.log('overflow detected!');
			if (!totalPagesPossible) pageNumber = 1;
			else pageNumber = totalPagesPossible;
		}
		var foundRows = this.foundRows;
		var minRange = (pageNumber - 1) * tableLength, maxRange = pageNumber * tableLength;
		if (maxRange == 0) maxRange = tableData.length;

		var sortingOrder = stateObj.sortingOrder;
		var sortingIndex = stateObj.sortingIndex;

		if (maxRange > foundRows) maxRange = foundRows;
		if (minRange > maxRange) {
			pageNumber = 1;
			minRange = 0;
			maxRange = foundRows > tableLength ? tableLength : foundRows;
		}

		var stickyRowHeight = maxRange - minRange + 1;
		var stickyRowHeight = stickyRows ? ((stickyRowHeight < stickyRows ? stickyRowHeight : stickyRows) * 37) + "px" : null;
		stickyRowHeight = null;

		var renderedHeaderCells = 0;

		var scrollDetectorIndexer = 0;
		var childCellEntrance = props.childRowEnabled || null;
		var CCEConstant = false;
		if (stickyRows && !stickyColumns) CCEConstant = true;

		var colResizable = props.colResizable;
		var customWidth = stateObj.customWidth;

		var createTable = function (headers, startRow, endRow, startColumn, endColumn, tag) {
			if (endRow > maxRange - 1) endRow = maxRange - 1;			
			var headerComp = null;
			var bodyComp = null;
			var rowCollection = [];
			var reqCells = endColumn - startColumn + (childCellEntrance ? 1 : 0) + 1;

			var stickyRowComp = !tag.search('sticky-row');
			
			if (!stickyRows || stickyRowComp) {
				headerComp = (
					<thead>
						<tr>
							{childCellEntrance ?
								<th
									className={props.childRowHeaderClassName || null}
									>
									<div 
										style={{
											whiteSpace: 'nowrap', 
											width: '100%', 
											paddingLeft: '18px', 
											visibility: 'hidden',
											textOverflow: 'ellipsis',
											overflow: 'hidden'
										}}
										/>
								</th> : null
							}
							{headers.map(function (item, index) {
								var actualIndex = renderedHeaderCells;
								renderedHeaderCells++;

								var headerClassName = item.className || null;
								var headerStyle = Object.assign({
									position: 'relative',
									userSelect: 'none'
								}, item.style || null);

								var colResizeCtrl = colResizable ?
											<div
												onMouseDown={self._startColResizing.bind(self, actualIndex)}
												style={{
													position: 'absolute',
													width: '8px',
													right: '-4px',
													height: '100%',
													top: '0px',
													cursor: 'move',
													zIndex: 1
												}}
												>
												<div
													style={{
														borderRight: '2px #b7ccc9',
														borderRightStyle: 'solid',
														// width: '2px',
														height: '100%',
														marginRight: '4px',
														float: 'right'
													}}
													/>
											</div>
												:
											null;

								var icStyle = { // Inner Container Style (div)
									whiteSpace: 'nowrap', 
									paddingLeft: '18px',
									overflow: 'hidden',
									textOverflow: 'ellipsis'
								}

								icStyle.width = customWidth[actualIndex] || '100%';

								if (!sortingEnabled || item.sortable === false) {
									return (
										<th 
											key={actualIndex}
											className={headerClassName}
											style={headerStyle}
										>
											<div 
												style={icStyle}
												>
												{item.labelNode || item.label}
											</div>
											{colResizeCtrl}
										</th>
									);
								}

								var sortingClass = "fa-sort";
								if (actualIndex == sortingIndex) {
									if (sortingOrder == 1) sortingClass = "fa-sort-amount-asc";
									else if (sortingOrder == -1) sortingClass = "fa-sort-amount-desc";
								}

								icStyle.paddingLeft = '18px';

								return (
									<th 
										key={actualIndex}
										className={headerClassName}
										style={headerStyle}
										onClick={self._onSortParamChange.bind(self, actualIndex)}
										>
										<i style={{fontSize: '.85em', position: 'absolute', lineHeight: '18px', color: '#50778b'}} className={"fa " + sortingClass}></i>
										<div 
											style={icStyle}
											>
											{item.labelNode || item.label}
										</div>
										{colResizeCtrl}
									</th>
								);
							})}
						</tr>
					</thead>
				);
				startRow++;
			}

			var rowCollection = [];
			for (var rowNum = startRow; rowNum < endRow + 1; rowNum++) {

				var rowConfig = tbodyRowConfig[rowNum] || {};
				var rowOnClick = rowConfig.onClick;
				if (rowOnClick) rowOnClick = rowOnClick.bind(null, item);

				var item = tableData[rowNum];

				var rowConfig = tbodyRowConfig[rowNum] || {};
				rowCollection.push(
					<TableRow
						firstRow={rowNum == startRow}
						rowConfig={rowConfig}
						parentComponent={self}
						customWidth={customWidth}
						key={rowNum}
						item={item}
						index={rowNum}
						ref={'table-' + (startColumn ? "t2" : "t1") + '-row-' + rowNum}
						childCellEntrance={childCellEntrance}
						startColumn={startColumn}
						endColumn={endColumn}
						/>
				);

				var child = rowChildren[rowNum];
				if (child) {
					rowCollection.push(
						<RowChild
							colSpan={item.length + (childCellEntrance ? 1 : 0)}
							node={child}
							key={rowNum + '-child'}
							/>
					);
				}
				
			}

			if (!stickyRowComp) {
				stateObj.additionalData.map(function (item, index) {
					rowCollection.push(
						<TableRow
							// firstRow={rowNum == startRow}
							// rowConfig={rowConfig}
							rowConfig={{}}
							additionalRow
							parentComponent={self}
							// Should we add `customWidth`
							key={'additional-row-' + index}
							item={item}
							index={rowNum + index + 1}
							// ref={'table-' + (startColumn ? "t2" : "t1") + '-row-' + rowNum}
							ref={null}
							childCellEntrance={childCellEntrance}
							startColumn={startColumn}
							endColumn={endColumn}
							></TableRow>
					);
				})
			}

			if (rowCollection.length) {
				bodyComp = (
					<tbody>
						{headerComp ?
							<tr style={{display: 'none'}}></tr> : null
						}
						{rowCollection}
					</tbody>
				);
			}

			childCellEntrance = CCEConstant ? childCellEntrance : typeof childCellEntrance == "boolean" ? !childCellEntrance : null;

			var tableStyle = {
				marginBottom: '0px',
				position: 'relative'	
			}

			if (!colResizable) {
				if (stickyRowComp) {
					tableStyle.minWidth = "100%";
				} else if (tag == "master-table") {
					tableStyle.width = "100%";
				}
			} else {
				tableStyle.width = 'auto';
			}

			return (
					<table ref={function (ref) {
						if (ref) {
							self[tag] = ref;
						} else self[tag] = null;
					}} className="rs-table rs-table-striped" style={tableStyle}>
						{stickyRowComp ?
							<colgroup>
								{(function () {
									var colCollection = [];
									for (var i = 0; i < reqCells; i++) {
										colCollection.push(<col key={i}/>);
									}
									return colCollection;
								})()}
							</colgroup> : null}
						{headerComp}
						{bodyComp}
					</table>
			);
		}

		var information = "Showing " + (foundRows ? (minRange + 1) : "0") + " to " + maxRange + " out of " + foundRows + " rows" + (searchValue ? " (filtered)" : "");

		var Pagination = [<div key="previous" onClick={pageNumber == !(pageNumber - 1) ? null : this._onValueChange.bind(this, {target: {name: 'pageNumber', value: pageNumber - 1}})} style={{color: pageNumber < 2 ? '#9ebab7' : '#217ac6', border: '1px solid #ddd', cursor: pageNumber < 2 ? 'not-allowed' : 'pointer', borderRadius: '4px 0px 0px 4px', lineHeight: '34px', height: '34px', verticalAlign: 'middle', display: 'inline-block', padding: '0px 12px'}}>Previous</div>];

		var totalPages = tableLength ? Math.ceil(foundRows / tableLength) + 1 : 1;
		var precedingThresholdCrossed = false, followingThresholdCrossed = false;
		var followingPageMisses = 0;
		var prevPageMisses = 4 - pageNumber;
		if (prevPageMisses < 0) prevPageMisses = 0;
		for (var parser = 1; parser < totalPages; parser++) {
			if (parser < pageNumber - 3) {
				followingPageMisses = pageNumber + 4 - totalPages;
				followingPageMisses = followingPageMisses > 0 ? followingPageMisses : 0;
				if (followingPageMisses < 0 || parser < pageNumber - 3 - followingPageMisses) {
					precedingThresholdCrossed = parser + followingPageMisses;
					continue;
				} 
			}
			if (parser > pageNumber + 3 + prevPageMisses) {
				followingThresholdCrossed = parser;
				break;
			}

			var p_onClick = null, p_color = 'white', p_backgroundColor = '#337ab7', p_fontWeight = 'bold', p_border = "none", p_cursor = "default"; 
			if (pageNumber != parser) {
				p_onClick = this._onValueChange.bind(this, {target: {name: 'pageNumber', value: parser}});
				p_color = '#217ac6';
				p_backgroundColor = 'white';
				p_fontWeight = 'normal';
				p_border = "1px solid #ddd";
				p_cursor = "pointer";
			}

			Pagination.push(
				<div 
					key={parser} 
					onClick={p_onClick} 
					style={{
						color: p_color,
						display: 'inline-block', 
						fontWeight: p_fontWeight, 
						border: p_border, 
						minWidth: '34px', 
						height: '34px', 
						textAlign: 'center', 
						lineHeight: '34px', 
						verticalAlign: 'middle', 
						marginLeft: "-1px", 
						backgroundColor: p_backgroundColor, 
						cursor: p_cursor
					}}>
						{parser}
				</div>
			);
		}
		
		var modifierPageNumClick = 1;
		if (precedingThresholdCrossed) {
			Pagination.splice(1, 0, <div key="first" onClick={pageNumber == !(pageNumber - 1) ? null : this._onValueChange.bind(this, {target: {name: 'pageNumber', value: 1}})} style={{color: pageNumber < 2 ? '#9ebab7' : '#217ac6', border: '1px solid #ddd', cursor: pageNumber < 2 ? 'not-allowed' : 'pointer', borderRadius: '0px', marginLeft: '-1px', lineHeight: '34px', height: '34px', verticalAlign: 'middle', display: 'inline-block', padding: '0px 12px'}}>1</div>);
			if (precedingThresholdCrossed - followingPageMisses == 2) {
				Pagination.splice(2, 0, <div onClick={this._onValueChange.bind(this, {target: {name: 'pageNumber', value: 2}})} key="preceding" style={{textAlign: 'center', minWidth: '34px', cursor: 'pointer', display: 'inline-block', color: '#217ac6', border: '1px solid #ddd', lineHeight: '34px', marginLeft: '-1px', height: '34px', verticalAlign: 'middle'}} >2</div>)
			} else if (precedingThresholdCrossed - followingPageMisses > 2) {
				if (precedingThresholdCrossed - 4 > modifierPageNumClick) modifierPageNumClick = precedingThresholdCrossed - 4;
				Pagination.splice(2, 0, <div onClick={this._onValueChange.bind(this, {target: {name: 'pageNumber', value: modifierPageNumClick}})} key="preceding" style={{textAlign: 'center', minWidth: '50px', cursor: 'pointer', display: 'inline-block', color: 'black', border: '1px solid #ddd', lineHeight: '26px', marginLeft: '-1px', height: '34px', verticalAlign: 'middle'}} >...</div>)
			}
		}
		if (followingThresholdCrossed) {
			if (followingThresholdCrossed + 4 > totalPages - 1) modifierPageNumClick = totalPages;
			else modifierPageNumClick = followingThresholdCrossed + 4;
			if (followingThresholdCrossed == totalPages - 2) {
				Pagination.push(<div onClick={this._onValueChange.bind(this, {target: {name: 'pageNumber', value: totalPages - 2}})} key="following" style={{textAlign: 'center', minWidth: '34px', cursor: 'pointer', display: 'inline-block', color: '#217ac6', border: '1px solid #ddd', lineHeight: '34px', marginLeft: '-1px', height: '34px', verticalAlign: 'middle'}}>{totalPages - 2}</div>)
			} else if (followingThresholdCrossed < totalPages - 2) {
				Pagination.push(<div onClick={this._onValueChange.bind(this, {target: {name: 'pageNumber', value: modifierPageNumClick}})} key="following" style={{textAlign: 'center', minWidth: '50px', cursor: 'pointer', display: 'inline-block', color: 'black', border: '1px solid #ddd', lineHeight: '26px', marginLeft: '-1px', height: '34px', verticalAlign: 'middle'}}>...</div>)
			}
			Pagination.push(<div key="last" onClick={pageNumber > totalPages - 2 ? null : this._onValueChange.bind(this, {target: {name: 'pageNumber', value: totalPages - 1}})} style={{color: pageNumber > totalPages - 2 ? '#9ebab7' : '#217ac6', border: '1px solid #ddd', cursor: pageNumber > totalPages - 2 ? 'not-allowed' : 'pointer', marginLeft: '-1px', borderRadius: '0px', lineHeight: '34px', height: '34px', verticalAlign: 'middle', display: 'inline-block', padding: '0px 12px'}}>{totalPages - 1}</div>);
		}
		Pagination.push(<div key="next" onClick={pageNumber > totalPages - 2 ? null : this._onValueChange.bind(this, {target: {name: 'pageNumber', value: pageNumber + 1}})} style={{color: pageNumber > totalPages - 2 ? '#9ebab7' : '#217ac6', cursor: pageNumber > totalPages - 2 ? 'not-allowed' : 'pointer', border: '1px solid #ddd', borderRadius: '0px 4px 4px 0px', marginLeft: '-1px', lineHeight: '34px', height: '34px', verticalAlign: 'middle', display: 'inline-block', padding: '0px 12px'}}>Next</div>)

		var availableTableLenArr = Object.keys(this.availableTableLenOptions);
		var skipOnDetailsObj = {};

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
			    zIndex: 1
			} : {
				position: 'relative', 
				display: 'inline-block', 
				width: '100%',
				transition: 'all .2s linear',
			    zIndex: 1
			}

		Object.assign(containerStyle, props.style || null);

		var emptyTableNotifier = props.emptyTableNotifier;

		var ETNElem = null; // ETNElem => Empty table notifier element!
		if (!foundRows) {
			if (!searchValue && emptyTableNotifier) {
				ETNElem = <div ref="no-data-notifier">{emptyTableNotifier}</div>;
			} else {
				ETNElem = <div ref="no-data-notifier" style={{width: '100%', lineHeight: '37px', height: '37px',/* backgroundColor: '#f9f9f9',*/ verticalAlign: 'middle', float: 'left', clear: 'both', display: 'flex', paddingLeft: '10px', fontWeight: 'bold', color: '#F44336'}}>{searchValue ? "No Matched Data" : "No results found!"}</div>;
			}
		}

		return (
			<div ref="container" className="rst-container" style={containerStyle}>
				{showRowDetailsOf ?
					<div ref="row-details" tabIndex="-1" onKeyDown={function (e) {if (e.key == "Escape") {self._hideRowDetails();}}} className="appear-animation" style={{position: 'relative', outline: 'none', padding: '15px', border: '1px solid #eee', borderRadius: '3px', zIndex: 2, width: '100%', height: '100%', minHeight: '350px', backgroundColor: 'white', top: '0px', left: '0px', overflow: 'auto'}}>
						<div style={{position: 'relative', width: '100%', display: 'block', float: 'left', padding: '10px'}}>
							<i className="fa fa-close" style={{float: 'right', cursor: "pointer"}} onClick={this._hideRowDetails}></i>
						</div>

						<div style={{float: 'left', width: '100%'}}>
							<div style={{float: 'left', width: '100%', borderBottom: '1px solid #eee', paddingBottom: '8px'}}>
								{rowDetailsDataView == "list" ?
									<button type="button" className="btn btn-default btn-sm" onClick={function () {self.setState({rowDetailsDataView: 'table'})}}><i className={"fa fa-table"} style={{marginRight: '5px'}}></i>Table View</button> :
									<button type="button" className="btn btn-default btn-sm" onClick={function () {self.setState({rowDetailsDataView: 'list'})}}><i className={"fa fa-list"} style={{marginRight: '5px'}}></i>List View</button>
								}
							</div>
							{rowDetailsDataView == "table" ?
								<table className="rs-table" style={{float: 'left', width: '100%', margin: '12px 0px'}}>
									<thead>
										<tr>
											{props.columns.map(function (item, index) {
												if (item.skipOnDetails === true) {
													skipOnDetailsObj[index] = true;
													return null;
												}
												return (
													<th key={index} style={{whiteSpace: 'pre'}}>{item.label}</th>
												);
											})}
										</tr>
									</thead>
									<tbody>
										<tr>
											{showRowDetailsOf.map(function (item, index) {
												if (skipOnDetailsObj[index] === true) return null;
												return (
													<td key={index}>{item.labelNode || item.label}</td>
												);
											})}
										</tr>
									</tbody>
								</table> :
								<div className="rs-list-view-container" style={{float: 'left', width: '100%', margin: '12px 0px'}}>
									{props.columns.map(function (item, index) {
										if (item.skipOnDetails === true) {
											return null;
										}

										var rowItem = showRowDetailsOf[index];
										return (
											<div key={index} className="row" style={{paddingBottom: '7px'}}>
												<div className="col-sm-3">
													<label className="rs-column-label" style={{width: '100%', paddingTop: '0px'}}>{item.label + ":"}</label>
												</div>
												<div className="col-sm-9">
													{rowItem.labelNode || rowItem.label}
												</div>
											</div>
										);
									})}
								</div>

							}
						</div>
						
						{props.getChild ? props.getChild(showRowDetailsOf) : null}
					</div> : null
				}
				<div style={{display: showRowDetailsOf ? 'none' : 'block', position: 'relative', paddingTop: '17px'}}>
					{props.movingScroller ?
						<div 
							ref='moving-scroller'
							style={{
								width: '100%',
								overflow: 'auto',
								position: 'absolute',
								top: '0px',
								height: '18px',
								zIndex: '4',
								marginTop: '0px',
								transition: stickerTransition
							}}
							onScroll={(e) => {
								var tableContainer = this.refs['table-container'];
								tableContainer.scrollLeft = e.target.scrollLeft;
								tableContainer.dispatchEvent(new Event('scroll'));
							}}
							>
							<div
								style={{
									height: '1px',
									backgroundColor: 'transparent'
								}}
								ref={node => {
									setTimeout(function () {
										if (node) {
											var pNode = this.refs['table-container'];
											if (pNode) {
												node.style.width = pNode.scrollWidth + 'px';
											}
										}
									}.bind(this), 50);
								}}
								>

							</div>
						</div>
							:
						null
					}
					<div style={{width: '100%', float: 'left'}}>

						{settings.tableLength ? <select name="tableLength" className="rs-form-control" value={tableLength || "All"} onChange={this._onValueChange} style={{display: 'inline-block', width: 'auto', height: '30px', padding: '0px 12px', float: 'left', margin: '8px 0px'}}>{availableTableLenArr.map(function (item, index) {return <option key={index} value={item}>{item}</option>})}</select> : null}
						{settings.search ?
							<div
								tabIndex={-1}
								onFocus={function (e) {
									if (e.currentTarget.contains(document.activeElement)) {
										if (!self.__searchDivSelectView) {
											self.refs['select-search-column'].style.display = "block";
											self.__searchDivSelectView = true;
										}
									}
								}}
								onBlur={function (e) {
									var currentTarget = e.currentTarget;
									setTimeout(function () {
										if (!currentTarget.contains(document.activeElement)) {
											if (self.__searchDivSelectView) {
												self.refs['select-search-column'].style.display = "none";
												self.__searchDivSelectView = false;
											}
										}
									}, 0);
								}}
								style={{outline: 'none', display: 'block', float: 'right', width: '185px', height: '44px', maxWidth: '100%'}}
								>
								<input name="searchValue" className="rs-form-control" value={searchValue} onChange={this._onValueChange} placeholder="Search" style={{display: 'inline-block', width: '100%', height: '30px', padding: '0px 12px', margin: '8px 0px'}}/>
								<select
									ref="select-search-column"
									name="searchColumnValue" 
									className="rs-form-control" 
									value={searchColumnValue} 
									onChange={this._onValueChange}
									/*
										***Important

										Need to work on positioning the following item to facilitate mobile-friendly view

									*/
								 	style={{display: 'none', position: 'relative', zIndex: 3, width: 'auto', height: '30px', padding: '0px 12px', float: 'right', margin: window.innerWidth > 480 ? '-38px 195px 0px 0px' : '-67px 0px 0px'}}>
								 		<option key="all" value={-1}>All</option>
								 		{props.columns.map(function (item, index) {
								 				if (item.searchable === false) return null;
								 				return (
								 					<option key={index} value={index}>{item.label}</option>
								 				);
								 			})
								 		}
								</select>
							</div> : null}

					</div>

					<div ref="table-container" style={{overflow: 'auto', width: '100%', position: 'relative', paddingTop: stickyRowHeight, paddingBottom: macOS ? '10px' : null}}>
						<div style={{clear: 'both', zIndex: 1, maxHeight: tableContainerMaxHeight}}>
							<div style={{clear: 'both', position: 'relative'}}>
								<div ref="sticky-table" style={{display: 'inline-block', position: 'absolute', backgroundColor: 'white', zIndex: 3}}>
									{stickyColumns ? createTable(stickyTableHeaders, minRange + stickyRows - 1, maxRange - 1, 0, stickyColumns - 1, 'sticky-col-table'): null}
									<div style={{position: 'absolute', height: '100%', width: '1px', backgroundColor: '#ccc', right: '0px', top: '0px', zIndex: 2}}></div>
								</div>
								<div 
									ref="scrollable-table" 
									style={{
										display: colResizable && foundRows ? 'inline-block' : 'block',
										width: colResizable ? null : '100%',
										position: 'relative', 
										zIndex: 2
									}}
									>
									{createTable(scrollableTableHeaders, minRange + stickyRows - 1, maxRange - 1, stickyColumns, props.columns.length - 1, 'master-table')}
								</div>
								{/*!foundRows && stickyRows < 2 ? <div ref="no-data-notifier" style={{width: '100%', lineHeight: '37px', height: '37px', backgroundColor: '#f9f9f9', verticalAlign: 'middle', float: 'left', clear: 'both', display: 'flex', paddingLeft: '10px'}}>{searchValue ? "No Matched Data" : "No results found!"}</div> : null*/}
								{ETNElem}
							</div>
						</div>

						{stickyRows ?
							<div style={{clear: 'both', position: 'absolute', backgroundColor: 'white', zIndex: 6, width: '100%', top: '0px', height: stickyRowHeight, transition: stickerTransition}}>
								<div ref="sticky-table-r" style={{display: null && 'inline-block', position: 'absolute', backgroundColor: 'white', zIndex: 2}}>
									{stickyColumns ? createTable(stickyTableHeaders, minRange - 1, minRange + stickyRows - 2, 0, stickyColumns - 1, 'sticky-row-col-table') : null}
									<div style={{position: 'absolute', height: '100%', width: '1px', backgroundColor: '#ccc', right: '0px', top: '0px', zIndex: 2}}></div>
									<div style={{position: 'absolute', width: '100%', height: '1px', backgroundColor: '#ccc', left: '0px', bottom: '0px', zIndex: 2}}></div>
								</div>
								<div 
									ref="scrollable-table-r" 
									style={{
										display: 'inline-block', 
										minWidth: colResizable ? null : '100%',
										position: 'relative', 
										backgroundColor: 'white',
										// borderBottom: '2px solid #ccc'
									}}
									>
									{createTable(scrollableTableHeaders, minRange - 1, minRange + stickyRows - 2, stickyColumns, props.columns.length - 1, 'sticky-row-table')}
									<div style={{position: 'absolute', width: '100%', height: '1px', backgroundColor: '#ccc', right: '0px', bottom: '0px', zIndex: 2}}></div>
								</div>
							</div> : null}
						
					</div>

					{props.afterTableNode || null}

					<div style={{width: '100%', float: 'left', padding: '10px'}}>
						{settings.information ?
							<div name="tableLength" style={{float: 'left'}}>
								<div style={{display: 'inline-block', height: '34px', textAlign: 'center', lineHeight: '2.3', verticalAlign: 'middle', fontWeight: 'bold', fontSize: '1.1em'}}>
									{information} 
								</div>
							</div> : null}
						{settings.pagination ? 
							<div style={{float: 'right', marginRight: '10px'}}>
								{Pagination}
							</div> : null}
					</div>
				</div>

			</div>
		);
	}
};
