import React, { Component } from 'react';

import { IconRemove, IconBottom, IconTop } from './Icons';

if (!document.head.querySelector('[data-component-name=RFE_Combo]')) {
    var newStyleObj = document.createElement('style');
    newStyleObj.dataset.componentName = "RFE_Combo";
    newStyleObj.innerHTML = 
`
.rfec-item {
	padding: 5px;
	cursor: pointer;
}

.rfec-item-hoverable:hover {
	background-color: #4579af;
	color: white;
}

.rfec-search-input {
	border: none;
	background-color: transparent;
	outline: none;
	height: 28px;
	box-sizing: border-box;
    font-size: 14px;
    line-height: 2;
    height: 20px;
    display: inline-block;
    position: relative;
}

.rfec-value-item {
	vertical-align: top;
    padding: 3px 8px;
    font-size: .75em;
    border-radius: 10px;
    background-color: #3f9679;
    color: white;
    font-weight: bold;
    display: inline-block;
    margin-right: 12px;
}

.rfec-interactor {
	position: absolute;
	width: calc(100% - 25px);
	border: none;
	background-color: transparent;
	outline: none;
	height: 28px;
	box-sizing: border-box;
	padding: 6px 12px;
    font-size: 14px;
    line-height: 1.42857143;
    left: 0px;
    top: 0px;
    cursor: text;
}

.rfec-option-container {
	position: absolute;
	z-index: 9999;
	width: 100%;
	left: 0px;
	top: 31px;
	border-radius: 0px 0px 8px 8px;
	border: solid #ccc;
	border-width: 0px 1px 1px 1px;
	background-color: white;
}

`;
    document.head.appendChild(newStyleObj);
}

class Item extends Component {
	constructor (props) {
		super(props);

		var self = this;

		this.state = {

		};

		[
			'_onClick'
        ].map(function (fn) {
            self[fn] = self[fn].bind(self);
        })
	}

	_onClick (e) {
		var props = this.props;
		props.onClick(props);
	}

	render () {
		var props = this.props;

		var style = null;
		if (props.selected) {
			style = {
				backgroundColor: '#46607c',
				color: 'white'
			};
		}

		return (
			<div
				onClick={this._onClick}
				style={style}
				className='rfec-item rfec-item-hoverable'
				>
				{props.label}
			</div>
		);
	}
}

export default class Combo extends Component {
	constructor (props) {
		super(props);

		var self = this;

		var file = props.file;
		var viewMode = file ? true : false;
		this.state = {
			searchValue: '',
			showOptions: false,
			value: props.value
		};

		[
			'_onSearchValueChange',
			'_onClick',
			'_onFocus',
			'_outsideClickCheck'
        ].map(function (fn) {
            self[fn] = self[fn].bind(self);
        })
	}

	componentWillReceiveProps (nextProps) {
		this.setState({
			value: nextProps.value
		})
	}

	_onSearchValueChange (e) {
		var targetObj = e.target;
		// var ow = targetObj.offsetWidth;
		// var sw = targetObj.scrollWidth;
		// if ()
		targetObj.style.width = targetObj.scrollWidth + 'px';

		this.setState({
			searchValue: e.target.value
		})
	}

	_onClick (data) {
		this.setState({
			value: data.selected ? '' : data.value
		}, function () {
			var _cb = this.props.onChange;
			if (_cb) {
				var e = new Event('change');
				this.refs['main'].dispatchEvent(e);
				_cb(e);
			}
		})
	}

	_onFocus () {
		this.refs.searcher.focus();
		this.setState({showOptions: true});
	}

	_outsideClickCheck (e) {
        if (this.state.showOptions) {
        	var targetObj = e.target;
        	if (!targetObj.isConnected) return false; // *When single item remover is clicked!
            if (!this.refs['container'].contains(e.target)) {
                this.setState({
                	showOptions: false,
                	searchValue: ''
                });
            }
        }
    }

	componentDidMount () {
		window.addEventListener('click', this._outsideClickCheck);
	}

	componentWillUnmount () {
		window.removeEventListener('click', this._outsideClickCheck);
	}

	emptyFn () {
		
	}

	render () {
		var self = this;
		var props = this.props;
		var stateObj = this.state;

		var rawElem = props.rawElem;
        var options = props.options || [];
        var _ip = props.internalProps; // _ip => internalProps
		var searchValue = stateObj.searchValue;
		var _lv = searchValue.toLowerCase(); // _lv => lowerCaseSearchValue

		var value = stateObj.value;

        var visibleOptions = [];
        var showOptions = stateObj.showOptions;
        var label = '';
        options.map((i) => {
        	var l = i.label;
        	if (l.toLowerCase().search(_lv) > -1) {
	    		var val = i.value;
	    		if (val != value) {
	        		visibleOptions.push(
	        			<Item
	        				key={val}
	        				label={l}
	        				value={val}
	        				selected={value == val}
	        				onClick={this._onClick}
	        				/>
	        		);
	    		} else {
	    			label = l;
	    		}
        	}
        });

        var id = _ip.id || null;
        var name = _ip.name || null;

        var modIp = {}; // modIp => modifiedInternalProps
        Object.assign(modIp, _ip);
        delete modIp.id;
        delete modIp.name;

		return (
			<div 
				style={{outline: 'none', position: 'relative', minHeight: '31px'}}
				tabIndex="-1"
				onFocus={this._onFocus}
				onBlur={this._onBlur}
				ref='container'
				>
				<select onChange={this.emptyFn} id={id} name={name} ref='main' value={value} style={{display: 'none'}}>
					<option value={value}>{value}</option>
				</select>
				<div style={{position: 'relative'}}>
					<div 
						{..._ip}
						>
						{showOptions ?
							<div
								className='rfec-option-container'
								>
								{visibleOptions.length ?
									visibleOptions
										:
									<div
										className='rfec-item'
										>
										No results found
									</div>
								}
							</div>
								:
							null
						}
					</div>
				</div>
				<div 
					className='rfec-interactor'					
					>
					{value ?
						<div
							className='rfec-value-item'
							>
							{label}
							<span>
								<IconRemove 
									onClick={self._onClick.bind(self, {selected: true})} // **Temporary basis 
									style={{fill: 'white', marginLeft: '7px', height: '10px', width: '10px'}} 
									/>
							</span>
						</div>
							:
						null
					}
					<input
						onChange={this._onSearchValueChange} 
						value={searchValue}
						style={{
							// position: 'absolute',
							// width: 'calc(100% - 25px)',
						    width: showOptions ? null : 'auto'
						    // left: '0px',
						    // top: '0px'
						}}
						className='rfec-search-input'
						ref='searcher'

						/>
					<div
						style={{
							position: 'absolute',
							right: '-17px',
							top: '6px'
						}}
						>
						{showOptions ? 
							<IconTop 
								onClick={() => { // **Temporary basis
									document.body.click();
									document.activeElement.blur();
								}} 
								/> 
								: 
							<IconBottom />
						}
					</div>
				</div>
			</div>
		);
	}
}