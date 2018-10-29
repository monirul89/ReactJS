import React, { Component } from 'react';

var macOS = navigator.userAgent.indexOf('Mac OS X') != -1 ? true : false;

var stickerTransition = 'margin-top .1s cubic-bezier(0.7, 0.13, 0.2, 1), top .1s cubic-bezier(0.7, 0.13, 0.2, 1)';
var heightTransition = 'height .2s ease-in-out';

class ChildComponents extends Component {
	constructor (props) {
		super(props);

		this.state = {
			renderedKeys: {}
		}

		this.prevItemLen = 0;
	}


	render () {
		var data = this.props.data;
		var stickyRows = this.props.stickyRows;
		var renderedKeys = this.state.renderedKeys;
		var items = [];

		for (var key in data) {
			var val = data[key];
			if (val) {
				items.push(
					<div
						key={key}
						data-key={key} // *Temporarily doing the job with this attribute
						style={{
							position: 'absolute',
							backgroundColor: 'white',
							top: '0px',
							height: '0px',
							width: '100%',
							transition: heightTransition,
							overflow: 'hidden'
						}}
						ref={function (node) {
							var key;
							if (!node) {
								return;
							} else {
								key = node.dataset.key;
								if (renderedKeys[key]) {
									node.style.height = renderedKeys[key];									
									return;
								}
							}
							
							var _p = 'previousSibling', _f = 'firstChild', _pn = 'parentNode';
							var container = node[_pn];
							var colCont = container[_p][_f]; // colCont => column-container
							var index = parseInt(key);
							var elem;
							if (index > stickyRows - 2) {
								elem = colCont[_f].children[index + 1];
								if (!elem) {
									console.warn('Invalid key(index) sent on rowChildren props');
									return;
								}
								node.style.top = elem.offsetTop + elem.offsetHeight + 'px';
							} else {
								elem = colCont.querySelector('.sticky-row-comp').children[index + 1];
								if (!elem) {
									console.warn('Invalid key(index) sent on rowChildren props');
									return;
								}
								node.style.top = elem.offsetTop + elem.offsetHeight + container[_pn].scrollTop + 'px';
							}

							var height = node.scrollHeight;
							// if (height < 200) height = 200;
							height = height + 'px';
							renderedKeys[key] = height;
							node.style.height = height;									
							setTimeout(() => {
								if (node.isConnected) {
									node.style.removeProperty('height');
									node.style.removeProperty('overflow');
								}
							}, 200)								

							// console.log(cols);
						}}
						>
						{val}
					</div>
				);
			}
		}

		return (
			<div 
				ref={(node) => {
					var prevLen = this.prevItemLen;
					var curLen = this.prevItemLen = items.length;
					if (node) {
				 		var pn = node.parentNode; 
						if (prevLen && !curLen) {
							pn.style.removeProperty('height');
						} else if (curLen) {
						 	setTimeout(() => {
								pn.style.height = pn.scrollHeight + 'px';
						 	}, 250)
						}
					}
				}}
				style={{position: 'absolute', top: '0px', left: '0px', width: '100%', zIndex: '4'}} >
				{items}
			</div>
		);

		return (items.length ?
			<div 
				ref={(node) => {
					 	setTimeout(() => {
							node.style.height = node.parentNode.scrollHeight + 'px';
					 	}, 250)
					if (node) {
					}
				}}
				style={{width: '100%', height: '0px', transition: heightTransition}}>
				<div style={{position: 'absolute', top: '0px', left: '0px', width: '100%', zIndex: '4'}}>
					{items}
				</div>
			</div>
				:
			null
		);
	}
}
// **Another thing to implement later
// class Pagination extends Component {
// 	render () {
// 		var props = this.props;

// 		var items

// 		return (items ?
// 			<div style={{float: 'right', marginRight: '10px'}}>
// 				{Pagination}
// 			</div>
// 				:
// 			null
// 		);
// 	}
// }

class TableCell extends Component {
	constructor (props) {
		super(props);

		this._onClick = this._onClick.bind(this);
	}

	shouldComponentUpdate () {
		return true;
	}

	componentWillReceiveProps () {

	}

	_onClick (e) {
		var props = this.props;
		props.onClick(props.data, props.cellIndex, props.rowIndex, e);
	}

	render () {
		var props = this.props;
		var {data, ccStyle, refKey, stickyRows, rowIndex} = props;
		var {title, label, labelNode, style, className, onClick} = data || {};		

		if (!title) {
			if (typeof label != 'object' && label)  title = label;
			else title = null;  
		}

		if (!labelNode) {
			labelNode = label;
		}

		if (ccStyle || style) {
			style = Object.assign({}, ccStyle, style || null);
		} else style = null;

		className = !className ? "" : className + ' ';
		className += 'rs-cell ';
		className += rowIndex % 2 ? 'rs-cell-even' : 'rs-cell-odd';
		
		return (
			<div
				ref='container'
				title={title}
				onClick={this._onClick}
				style={style}
				className={className || null}
				>
				{labelNode || <div style={{visibility: 'hidden'}} className='rs-filler'>x</div>}
			</div>
		);
	}
}

export default class ReactStickyTable extends Component {
	constructor (props) {
		super(props);
		var self = this;

		var stateSetter = this.generateState(props);

		this.controlledDataUpdate = props.controlledDataUpdate === true ? true : false;
		this.controlledUpdate = props.controlledUpdate === true ? true : false;

		this.__searchDivSelectView = false;
		this.denyUpdate = false;

		[
			"generateState",
			"_onValueChange",
			"scrollHandler",
			"resizeHandler",
			"movingScrollHandler",
			"onScrollSRTHandler",
			"_rowClickHandler",
			"_cellClickHandler",
			"update",
			"makeSticky",
			"_startColResizing"
		].map(function (fn) {
			self[fn] = self[fn].bind(self);
		})

		if (!document.head.querySelector('[data-component-name=ReactStickyTableFlex]')) {
			var newStyleObj = document.createElement('style');
			newStyleObj.dataset.componentName = "ReactStickyTableFlex";
			newStyleObj.innerHTML = 
`
.rs-form-control{border-radius:4px;border:1px solid #ccc;height:34px;box-shadow:inset 0 1px 1px rgba(0,0,0,.075);transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s;font-family:inherit}.rs-form-control:focus{border-color:#66afe9;outline:0;box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6)}.appear-animation{animation-name:appanm;animation-duration:.38s}@keyframes appanm{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}.rs-fade-in-out{animation-name:rs_fade_in_out;animation-duration:1s;animation-iteration-count:infinite;animation-timing-function:ease-in-out;animation-direction:alternate}@keyframes rs_fade_in_out{from{opacity:.2}to{opacity:1}}
.rs-cell {
	white-space: nowrap;
	padding: 5px 8px;	
	border-top: 1px solid #ccc;
	background-color: white;
	overflow: hidden;
	text-overflow: ellipsis;
}
.rs-cell:hover {
	background-color: #eaeaea;
}

.rs-cell-even {
	background-color: #fbf8f8;
}

.rs-cell-odd {
	background-color: white;
}

.prevent-select {
	-webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none; 
}
`;
			document.head.appendChild(newStyleObj);
		}

		this.state = stateSetter;

		if (process.env.NODE_ENV != 'production') {
			window.__comp = this;
		}
	}

	generateState (props) {
		var self = this;
		var stateObj = this.state || {};
		props = typeof props == 'undefined' ? this.props : props;

		var stickyColumns = parseInt(props.stickyColumns);
		var stickyRows = parseInt(props.stickyRows);

		if (isNaN(stickyColumns) || stickyColumns < 0) stickyColumns = 0;
		if (isNaN(stickyRows) || stickyRows < 0) stickyRows = 0;

		var givenData = props.data;
		var givenDLen = givenData.length;
		var tableData = null;
		var internalTableData = null;

		var givenColumns = props.columns;
		var givenCLen = givenColumns.length;
		var stickyTableHeaders = [], scrollableTableHeaders = [];

		var tableLength = props.tableLength || stateObj.tableLength;
		if (!tableLength && tableLength != 0) tableLength = 10;

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

		var totalRows = props.totalRows;

		var stateSetter = {
			stickyRows: stickyRows,
			stickyColumns: stickyColumns,
			searchValue: searchValue,
			tableLength: tableLength,
			pageNumber: pageNumber,
			sortingIndex: sortingIndex,
			sortingOrder: sortingOrder,
			totalRows: totalRows,
			searchColumnValue: props.searchColumnValue || stateObj.searchColumnValue || -1,
			additionalData: props.additionalData || [],
			tableData: props.data	
		}

		return stateSetter;
	}

	componentWillReceiveProps (nextProps) {
		this.setState(this.generateState(nextProps));
	}

	scrollHandler (e) {
		var refs = this.refs;
		var tableContainer = refs['table-container-par'];
		var props = this.props;
		var stateObj = this.state;
		
		if (stateObj.stickyColumns) {
			var bStickyComp = refs['b-sticky'];
			var lastElem = bStickyComp.lastElementChild; // lastElementChild of bStickyComp
			var stickyWidth = lastElem.offsetLeft + lastElem.offsetWidth;
			var scrollLeft = tableContainer.scrollLeft;

			if (tableContainer.offsetWidth > stickyWidth + 250) {
				refs['b-sticky'].style.left = scrollLeft + 'px';
			} else {
				refs['b-sticky'].style.left = '0px';
			}

			if (scrollLeft) {
				refs['b-sticky'].style.boxShadow = '#b7bec1 1px 0px 20px 0px';
			} else {
				refs['b-sticky'].style.removeProperty('box-shadow');
			}
		}

		if (stateObj.stickyRows) {
			if (!this.props.scrollContainer) { // *** Any positive value present here will invoke the same operation
				var token = Math.random();
				this.__marginTopToken = token;

				setTimeout(function () {
					if (this.__marginTopToken == token) {
						// **Just Testing

						var top = tableContainer.scrollTop, topStr = top + 'px';
						console.log(top);
						if (tableContainer.querySelector('.col-container').offsetHeight < top) {
							top = 0, topStr = '0px';
						}
						tableContainer.querySelectorAll('.sticky-row-comp').forEach((node) => {
							node.style.top = topStr;
							if (top) node.style.boxShadow = '#b7bec1 2px 1px 20px';
							else node.style.removeProperty('box-shadow');
						})

						// this['sticky-row-table'].parentNode.parentNode.style.marginTop = tableContainer.scrollTop + "px";
					}
				}.bind(this), 300);
			}
		}

		if (props.movingScroller) {
			this.movingScrollHandler();
		}

	}

	resizeHandler () {
		// **Should we update even if there's no sticky column or rows!

		var token = Math.random();
		this.__resizeToken = token;

		setTimeout(function () {
			if (this.__resizeToken == token) {
				this.forceUpdate();
			}
		}.bind(this), 300);
	}

	movingScrollHandler () {
		if (!this.props.movingScroller) return;
		var movingScroller = this.refs['moving-scroller'];
		var rect = movingScroller.parentNode.getBoundingClientRect();
		// if (rect.bottom > 400) {
		if (rect.bottom > 250) {
			var top = rect.top;
			if (top > 0) {
				top = 0;
			}
			movingScroller.style.marginTop = -top + 'px';
		}
		movingScroller.scrollLeft = this.refs['table-container-par'].scrollLeft;
	}

	onScrollSRTHandler (e) {
		var self = this;
		var props = this.props;
		var stateObj = this.state;
		if (props.scrollContainer != window) return;
		if (!stateObj.stickyRows) return;
		// var node = this.refs['b-sticky'].parentNode.parentNode;
		var node = this.refs['b-regular'];
		var node_2 = this.refs['b-sticky'];

		var tableContainer = this.refs['table-container-par'];

		var rect = node.parentNode.getBoundingClientRect();
		// console.log(rect);
		if (rect.bottom > 250) {
			var top = rect.top, topStr = '';
			if (top > 0) {
				top = 0, topStr = '0px';
				// node.style.marginTop = '0px';
				// if (node_2) node_2.style.marginTop = '0px';
			} else {
				var mover = this.refs['moving-scroller'];

				top = -top + (this.props.movingScroller && mover.scrollWidth > mover.offsetWidth ? 18 : 0), topStr = top + 'px';
				
				// node.style.marginTop = val;
				// if (node_2) node_2.style.marginTop = val;
			}

			if (tableContainer.querySelector('.col-container').offsetHeight < top) {
				top = 0, topStr = '0px';
			}

			tableContainer.querySelectorAll('.sticky-row-comp').forEach((n) => {
				n.style.top = topStr;
				if (top) n.style.boxShadow = '#b7bec1 2px 1px 20px';
				else n.style.removeProperty('box-shadow');
			})
			// node.scrollLeft = this.refs['table-container-par'].scrollLeft;
		}
	}

	componentDidMount () {
		var self = this;
		var refs = this.refs;
		var props = this.props;
		var tableContainer = refs['table-container-par'];

		tableContainer.addEventListener('scroll', this.scrollHandler);
		window.addEventListener('resize', this.resizeHandler);

		window.addEventListener('scroll', this.onScrollSRTHandler);
		window.addEventListener('scroll', this.movingScrollHandler);

		setTimeout(() => {
			this.makeSticky();
		}, 500);
	}

	componentDidUpdate (prevProps, prevState) {
		if (this.state.showRowDetailsOf) return;
		this.makeSticky(prevProps, prevState);
	}

	makeSticky (prevProps, prevState) {
		// Have to identify the cases when this is necessary

		var stateObj = this.state;
		prevState = prevState || stateObj;
		var {stickyRows, stickyColumns} = stateObj;
		var refs = this.refs;

		if (stickyColumns) {
			var bStickyComp = refs['b-sticky'];
			bStickyComp.style.position = 'absolute';
			var tableContainer = refs['table-container-par'];
			var lastElem = bStickyComp.lastElementChild; // lastElementChild of bStickyComp
			var stickyWidth = lastElem.offsetLeft + lastElem.offsetWidth;
			// var stickyWidth = bStickyComp.offsetWidth;
			var scrollLeft = tableContainer.scrollLeft;
			if (tableContainer.offsetWidth > stickyWidth + 250) {
				bStickyComp.style.removeProperty('height');
				tableContainer.style.paddingLeft = stickyWidth + 'px';
				refs['b-sticky'].style.left = scrollLeft + 'px';
			} else {
				bStickyComp.style.position = 'relative';
				bStickyComp.style.height = '100%';
				tableContainer.style.paddingLeft = '0px';
				refs['b-sticky'].style.left = '0px';
			}
		} else if (prevState.stickyColumns) {
			refs['table-container-par'].style.removeProperty('padding-left');
		}
	}

	componentWillUnmount () {
		this.refs['table-container-par'].removeEventListener('scroll', this.scrollHandler);
		window.removeEventListener('resize', this.resizeHandler);
		window.removeEventListener('scroll', this.onScrollSRTHandler);
		window.removeEventListener('scroll', this.movingScrollHandler);
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

	_startColResizing (e) {
		var self = this;

		if (e.button != 0) return;
		if (self.__colResizingEnabled) return;

		document.body.classList.add('prevent-select');

		var mover = document.createElement('div');
		var targetObj = e.currentTarget;
		var container = targetObj.parentNode;
		var curWidth = container.offsetWidth;
		var limit = curWidth - 20;
		var diff = 0;
		var ctrl = targetObj.firstElementChild;
		ctrl.style.border = '1px dashed #aaa';
		var tableContainer = this.refs['table-container-par'];

		var offset = targetObj.getBoundingClientRect().left + 6 - tableContainer.getBoundingClientRect().left + tableContainer.scrollLeft;
		mover.style.cssText = 'border-right:2px dotted #327ba7;height:' + tableContainer.scrollHeight + 'px;top:0px;position:absolute;left:' + offset + 'px;z-index:6';
		tableContainer.appendChild(mover);

		var __startingPos = e.pageX;
		self.__colResizingEnabled = true;

		self._int_mouseMove = function (e) { // Interim stage mouse move event function
			diff = __startingPos - e.pageX;
			if (diff > limit) diff = limit; 
			mover.style.left = offset - diff + 'px';
		}

		self._int_click = function (e) { // // Interim stage click event function
			window.removeEventListener('mousemove', self._int_mouseMove);
			window.removeEventListener('mouseup', self._int_click);
			window.removeEventListener('contextmenu', self._int_click);
			mover.remove();

			var width = curWidth - diff;

			var type = container.parentNode.style.display;
			container.style.overflow = 'hidden';
			if (type == 'inline-flex') {
				container.style.width = width + 'px';
			} else {
				container.style.flex = '0 0 ' + width + 'px';
			}

			ctrl.style.removeProperty('border');
			document.body.classList.remove('prevent-select');
			self.forceUpdate(() => {
				self.__colResizingEnabled = false;
			});
		}

		window.addEventListener('mousemove', self._int_mouseMove);
		window.addEventListener('mouseup', self._int_click);
		window.addEventListener('contextmenu', self._int_click);
	}

	_rowClickHandler (item, index, rowConfig, e) {
		var props = this.props
		if (rowConfig.onClick) rowConfig.onClick.call(this, item, index, e);
		if (props.onRowClick) props.onRowClick.call(this, item, index, e);
	}

	_cellClickHandler (item, index, rowIndex, e) {
		var props = this.props;
		var rowItem = (this.state.tableData || [])[rowIndex];
		if (item.onClick) item.onClick.call(this, item, index, rowItem, rowIndex, e);
		if (props.onCellClick) props.onCellClick.call(this, item, index, rowItem, rowIndex, e);

		this._rowClickHandler(rowItem, rowIndex, {}, e);
	}

	update (props) {
		var self = this;
		var prevControlledDataUpdate = this.controlledDataUpdate;
		this.controlledDataUpdate = false;

		["searchValue", "tableLength", "pageNumber", "sortingIndex", "sortingOrder", "searchColumnValue", "totalRows", "stickyColumns", "stickyRows", "rowConfig", "columns", "data", "additionalData"].map(function (item, index) {if (!(item in props)) {props[item] = self.props[item];}})
		
		this.setState(this.generateState(props), function () {
			this.controlledDataUpdate = prevControlledDataUpdate;
		});
	}

	render () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;

		var rowChildren = props.rowChildren || {};
	
		var settings = { // **Using default settings for now
			information: true,
			pagination: true,
			tableLength: false,
			search: false,
			sorting: false
		}

		var stickyColumns = stateObj.stickyColumns;
		var stickyRows = stateObj.stickyRows;

		var tableData = stateObj.tableData || [];
		var tableContainerMaxHeight = parseInt (props.tableContainerMaxHeight);
		if (isNaN(tableContainerMaxHeight)) tableContainerMaxHeight = "auto";

		var searchValue = stateObj.searchValue;
		var tableLength = stateObj.tableLength; 
		var searchColumnValue = parseInt(stateObj.searchColumnValue);
		if (tableLength == 'All') tableLength = tableData.length;
		
		var pageNumber = stateObj.pageNumber || 1, totalPagesPossible;

		var foundRows, minRange, maxRange;

		if (props.auto) { // *For Future Purpose
			foundRows = this.foundRows;
		} else {
			minRange = 0;
			maxRange = tableLength || tableData.length;

			foundRows = stateObj.totalRows;
			if (foundRows == null) foundRows = maxRange;
			totalPagesPossible = Math.ceil(foundRows / pageNumber);
		}

		// var totalPagesPossible = tableLength ? Math.ceil(tableData.length / tableLength) : 1;
		if (pageNumber > totalPagesPossible) {
			//console.log('overflow detected!');
			if (!totalPagesPossible) pageNumber = 1;
			else pageNumber = totalPagesPossible;
		}

		var infoMinRange = (pageNumber - 1) * tableLength, infoMaxRange = pageNumber * tableLength;
		if (infoMaxRange == 0) infoMaxRange = tableData.length;

		if (infoMaxRange > foundRows) infoMaxRange = foundRows;
		if (infoMinRange > infoMaxRange) {
			pageNumber = 1;
			infoMinRange = 0;
			infoMaxRange = foundRows > tableLength ? tableLength : foundRows;
		}

		if (props.auto) {
			minRange = infoMinRange;
			maxRange = infoMaxRange;
		}

		var additionalData = stateObj.additionalData;

		var sortingOrder = stateObj.sortingOrder;
		var sortingIndex = stateObj.sortingIndex;

		var colResizable = props.colResizable;

		var cellClickHandler = this._cellClickHandler;

		/*
			item => the row data
			ccRow => row Index
			colStart => column index to start from
			colEnd => column index to end with
			container => the object holding the column components
			config => other configuration of the row

		*/

		var generateRow = function (item, ccRow, colStart, colEnd, container, config) {
			config = config || {};
			var row = item;
			if (!row) {
				// console.warn('Skipping empty rows for now, check it out later!', arguments); // ***
				return;
			}

			var ccStyle = config.style || null; // ccStyle => configCellStyle

			var rk = 'r' + ccRow; // rk => row-key
			var ccColumn = 0; // ccColumn => colComponentsColumn
			for (var j = colStart; j < colEnd + 1; j++) {
				var key = rk + '-c' + j;

				var cellProps = {
					data: row[j],
					ccStyle: ccStyle,
					rowIndex: ccRow - 1,
					cellIndex: j,
					ref: key,
					key: key,
					stickyRows: stickyRows,
					onClick: cellClickHandler
				}

				container[ccColumn++][ccRow] = (
					<TableCell {...cellProps} />
				);
			}
		}


		var blockComponents = [];
		var columns = props.columns;
		var colLen = columns.length;

		var sColComponents = []; // sColComponents => stickyColumnComponents
		var ccColumn = 0; // ccColumn => colComponentsColumn
		for (var j = 0; j < stickyColumns; j++) sColComponents[ccColumn++] = [];

		var ccRow = 1; // ccRow => colComponentsRow
		generateRow(columns, 0, 0, stickyColumns - 1, sColComponents, {style: {backgroundColor: '#efefef', fontWeight: 'bold'}});
		for (var i = minRange; i < maxRange; i++) {
			generateRow(tableData[i], ccRow, 0, stickyColumns - 1, sColComponents);
			ccRow++;
		}

		ccRow = tableData.length + 1;
		for (var i = maxRange; i < maxRange + additionalData.length; i++) {
			generateRow(additionalData[i - maxRange], ccRow, 0, stickyColumns - 1, sColComponents);
			ccRow++;
		}

		blockComponents.push(
			<div
				ref="b-sticky"
				key={"b-sticky"} // b stands for block
				style={{
					display: 'inline-flex',
					zIndex: '3'
					// width: '100%'
				}}
				>
				{sColComponents.map((c, i) => {
					var stickyRowComp = null;
					if (stickyRows) {
						stickyRowComp = [];
						for (var j = 0; j < stickyRows; j++) stickyRowComp.push(c[j]);
						stickyRowComp = (
							<div
								style={{
									position: 'absolute',
									top: '0px',
									width: '100%',
									transition: stickerTransition,
									// borderBottom: '1.5px solid #ccc'
								}}
								className='sticky-row-comp'
								>
								{stickyRowComp}
								<div style={{width: '100%', height: '1.5px', backgroundColor: '#ccc', bottom: '0px', position: 'absolute'}} />
							</div>
						);
					}

					var _s = {
						display: 'inline-block', 
						position: 'relative'
					}

					if (stickyColumns == i + 1) _s.borderRight = '1.5px solid #ccc';

					return (
						<div 
							key={"c-" + i} 
							style={_s}>
							<div className='col-container'>{c}</div>

							{colResizable ?
								<div
									onMouseDown={self._startColResizing}
									style={{
										position: 'absolute',
										width: '6px',
										right: '0px',
										// right: '-1px',
										height: '100%',
										top: '0px',
										cursor: 'col-resize',
										zIndex: "2"
									}}
									>
									<div
										className='col-right-border'
										style={{
											backgroundColor: '#ddd',
											width: '1px',
											height: '100%',
											float: 'right'
										}}
										/>
								</div>
									:
								null
							}

							{stickyRowComp}
						</div>
					);
				})}
			</div>
		);

		var rColComponents = []; // rColComponents => regularColumnComponents
		var ccColumn = 0; // ccColumn => colComponentsColumn
		for (var j = stickyColumns; j < colLen; j++) rColComponents[ccColumn++] = [];

		var ccRow = 1; // ccRow => colComponentsRow
		generateRow(columns, 0, stickyColumns, colLen - 1, rColComponents, {style: {backgroundColor: '#efefef', fontWeight: 'bold'}});
		for (var i = minRange; i < maxRange; i++) {
			generateRow(tableData[i], ccRow, stickyColumns, colLen - 1, rColComponents);
			ccRow++;
		}

		ccRow = tableData.length + 1;
		for (var i = maxRange; i < maxRange + additionalData.length; i++) {
			generateRow(additionalData[i - maxRange], ccRow, stickyColumns, colLen - 1, rColComponents);
			ccRow++;
		}
		
		blockComponents.push(
			<div
				ref="b-regular"
				key={"b-regular"} // b stands for block
				style={{
					display: 'flex',
					width: '100%',
					height: '100%',
					zIndex: '2'
				}}
				>
				{rColComponents.map((c, i) => {
					var stickyRowComp = null;
					if (stickyRows) {
						stickyRowComp = [];
						for (var j = 0; j < stickyRows; j++) stickyRowComp.push(c[j]);
						stickyRowComp = (
							<div
								style={{
									position: 'absolute',
									top: '0px',
									width: '100%',
									transition: stickerTransition,
									// borderBottom: '1.5px solid #ccc'
								}}
								className='sticky-row-comp'
								>
								{stickyRowComp}
								<div style={{width: '100%', height: '1.5px', backgroundColor: '#ccc', bottom: '0px', position: 'absolute'}} />
							</div>
						);
					}

					return (
						<div className='col-wrapper' key={"c-" + i} style={{display: 'inline-block', width: '100%', position: 'relative'}}>
							<div className='col-container'>{c}</div>
							{colResizable ?
								<div
									onMouseDown={self._startColResizing}
									style={{
										position: 'absolute',
										width: '6px',
										right: '0px',
										// right: '-1px',
										height: '100%',
										top: '0px',
										cursor: 'col-resize',
										zIndex: "2"
									}}
									>
									<div
										className='col-right-border'
										style={{
											backgroundColor: '#ddd',
											width: '1px',
											height: '100%',
											float: 'right'
										}}
										/>
								</div>
									:
								null
							}
							{stickyRowComp}
						</div>
					);
				})}
			</div>
		);

		var information = "Showing " + (foundRows ? (infoMinRange + 1) : "0") + " to " + infoMaxRange + " out of " + foundRows + " rows" + (searchValue ? " (filtered)" : "");

		var Pagination = [<div key="previous" onClick={pageNumber == !(pageNumber - 1) ? null : this._onValueChange.bind(this, {target: {name: 'pageNumber', value: pageNumber - 1}})} style={{color: pageNumber < 2 ? '#9ebab7' : '#217ac6', border: '1px solid #ddd', cursor: pageNumber < 2 ? 'not-allowed' : 'pointer', borderRadius: '20px 0px 0px 20px', lineHeight: '34px', height: '34px', verticalAlign: 'middle', display: 'inline-block', padding: '0px 12px'}}>Previous</div>];

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
		Pagination.push(<div key="next" onClick={pageNumber > totalPages - 2 ? null : this._onValueChange.bind(this, {target: {name: 'pageNumber', value: pageNumber + 1}})} style={{color: pageNumber > totalPages - 2 ? '#9ebab7' : '#217ac6', cursor: pageNumber > totalPages - 2 ? 'not-allowed' : 'pointer', border: '1px solid #ddd', borderRadius: '0px 20px 20px 0px', marginLeft: '-1px', lineHeight: '34px', height: '34px', verticalAlign: 'middle', display: 'inline-block', padding: '0px 12px'}}>Next</div>)

		var containerStyle = {
			position: 'relative', 
			display: 'inline-block', 
			width: '100%',
			transition: 'all .2s linear',
		    zIndex: 1
		}

		Object.assign(containerStyle, props.style || null);

		var emptyTableNotifier = props.emptyTableNotifier;
		if (typeof emptyTableNotifier == 'string') {
			emptyTableNotifier = <div style={{padding: '8px'}}>{emptyTableNotifier}</div>;
		}

		return (
			<div ref="container" className="rst-container" style={containerStyle}>
				<div style={{display: 'block', position: 'relative', paddingTop: '17px'}}>
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
								var tableContainer = this.refs['table-container-par'];
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
											var pNode = this.refs['table-container-par'];
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

					<div ref="table-container-par" style={{overflow: 'auto'}}>
						<div ref="table-container" className='rs-table-container' style={{width: '100%', /*overflow: 'auto',*/ display: 'flex', position: 'relative', paddingBottom: macOS ? '10px' : '2px', maxHeight: tableContainerMaxHeight}}>
							{blockComponents}
							<ChildComponents data={rowChildren} stickyRows={stickyRows}/>
						</div>
						{tableData.length ? null : <div>{emptyTableNotifier || <div style={{color: '#F44336', padding: '8px', fontWeight: 'bold'}}>No Results Found</div>}</div>}
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
