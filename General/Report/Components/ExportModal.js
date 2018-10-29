import React from 'react';
// import SelectField from './General/CommonComponents/SelectField';
import SelectField from './General/CommonComponents/SelectField2';
// import TextField from './General/CommonComponents/TextField';
import TextField from './General/CommonComponents/TextField2';
import Checkbox from './General/CommonComponents/Checkbox';
import RaisedButton from './General/CommonComponents/RaisedButton';

import TopLoader from './General/TopLoader';

import commonFunctions from '../Utils/commonFunctions';
import ServerAPI from '../Utils/ServerAPI';

var pdfSizes = [
    {name: "Letter", width: 215.9,height: 279.4},
    {name: "Legal", width: 215.9,height: 355.6},
    {name: "Ledger", width: 431.8,height: 279.4},
    {name: "Tabloid", width: 279.4, height: 431.8},
    {name: "Executive", width: 190.5, height: 254},
    {name: "Folio", width: 210, height: 330},
    {name: "A0", width: 841, height: 1189},
    {name: "A1", width: 594, height: 841},
    {name: "A2", width: 420, height: 594},
    {name: "A3", width: 297, height: 420},
    {name: "A4", width: 210, height: 297},
    // {name: "A5", width: 148, height: 210},
    // {name: "A6", width: 105, height: 148},
    // {name: "A7", width: 74, height: 105},
    // {name: "A8", width: 52, height: 74},
    // {name: "A9", width: 37, height: 52},
    {name: "B0", width: 1000, height: 1414},
    {name: "B1", width: 707, height: 1000},
    {name: "B2", width: 500, height: 707},
    {name: "B3", width: 353, height: 500},
    {name: "B4", width: 250, height: 353}
    // {name: "B5", width:176, height: 250},
    // {name: "B6", width:125, height: 176},
    // {name: "B7", width:88, height: 125},
    // {name: "B8", width:62, height: 88},
    // {name: "B9", width:33, height: 62},
    // {name: "B10", width:31, height: 44},
    // {name: "C5E", width:163, height: 229},
    // {name: "Comm10E", width: 105, height: 241},
    // {name: "DLE", width: 110, height: 220}
].map(function (i) {
	var name = i.name;
	return {
	    label: name + " (" + i.width + " x " + i.height + " mm)",
	    value: name
	};
})

// pdfSizes.unshift({label: 'Custom', value: 'Custom'});

var tableStyleOptions = [
	{
		label: 'Column Divider',
		key: 'columnDivider'
	}, {
		label: 'Row Divider',
		key: 'rowDivider'
	}, {
		label: 'Alternate Row Color',
		key: 'alternateRowColor'
	}, {
		label: 'Condensed Table',
		key: 'tableCondensed'
	}, {
		label: 'Font Size',
		key: 'fontSize',
		type: 'text'
	}
]

export default class ExportModal extends React.Component {
	constructor (props) {
		super(props);
		var self = this;

		var excludedFields = props.excludedFields;

		var fields = {};
  		props.reportInfo.map(function (item, index) {
			var fieldName = item.FieldName;
			if (item.Hide == '1' || fieldName == '__Master_Did') return null;
			else if (!item.Name) {
				console.warn('Field "' + fieldName + '" doesn\'t have a name associated! Skipped for now!');
				item.Name = fieldName;
			}
			fields[fieldName] = {
				selected: excludedFields[fieldName] ? false : true,
				name: item.Name,
				fieldName: fieldName,
				reportTitle: ''
			};
		})

		this.state = {
			loaderArr: [{state: 'transit', title: 'Component rendering in progress!'}],
			paperSize: '',
			paperOrientation: 'Portrait',
			fields: fields,
			reportTitle: '',
			reportType: '',
			paperWidth: "",
			paperHeight: "",
			columnDivider: true,
			rowDivider: true,
			alternateRowColor: true,
			tableCondensed: false,
			fontSize: 15
		}

		var storedData = JSON.parse(localStorage.getItem('export-modal-state') || "{}")[props.Did];
		if (storedData) {
			if (Object.keys(storedData.fields).sort().toString() == Object.keys(fields).sort().toString()) {
				Object.assign(this.state, storedData);
			}
		}

		this.shouldComponentUpdate = commonFunctions.defaultShouldComponentUpdate;
		this.getLoaderArr = commonFunctions.getLoaderArr.bind(this);

		[
			"_onPaperSizeChange",
			"_onOrientationChange",
			"_selectAll",
			"_selectNone",
			"_onReportTitleChange",
			"_onReportTypeChange",
			"_onDimensionChange",
			"getData"
		].map(function (fn) {
			self[fn] = self[fn].bind(self);
		})
	}

	// _onPaperSizeChange (e, index, value) {
	_onPaperSizeChange (value) {
		// console.log("Paper Size", e, index, value);
		this.setState({
			paperSize: value ? value.value : ''
		})
	}

	_onOrientationChange (e, value) {
		// console.log("Paper Orientation", e, value);
		this.setState({
			paperOrientation: value
		})
	}

	_selectAll () {
		var fields = this.state.fields;
		Object.keys(fields).map(function (key) {
			fields[key].selected = true;
		})
		this.forceUpdate();
	}

	_selectNone () {
		var fields = this.state.fields;
		Object.keys(fields).map(function (key) {
			fields[key].selected = false;
		})
		this.forceUpdate();
	}

	_onReportTitleChange (e, value) {
		this.setState({reportTitle: value})
	}

	// _onReportTypeChange (e, index, value) {
	_onReportTypeChange (value) {
		value = value ? value.value : '';
		this.setState({reportType: value}, value ? function () {
			window.dispatchEvent(new Event('resize'));
		} : null)
	}

	_onDimensionChange (e, value) {
		this.setState({[e.target.name]: value});
	}

	getData () {
		var stateObj = this.state;
		var res = {};
		['paperSize', 'paperOrientation', 'fields', 'reportTitle', 'reportType', 'paperWidth', 'paperHeight', 'columnDivider', 'rowDivider', 'alternateRowColor', 'tableCondensed', 'fontSize'].map((i) => res[i] = stateObj[i]);
		return res;
	}

	componentWillUnmount () {
		var prevDataObj = localStorage.getItem('export-modal-state');
		if (!prevDataObj) prevDataObj = {};
		else prevDataObj = JSON.parse(prevDataObj);

		var data = this.getData();		
		prevDataObj[this.props.Did] = data;

		localStorage.setItem('export-modal-state', JSON.stringify(prevDataObj));
	}

	render () {
		var self = this;
		var stateObj = this.state;

		var fields = stateObj.fields;
		var fieldArr = Object.keys(fields);

		var reportType = stateObj.reportType;
		var PDFSelected = reportType == 'PDF' ? true : false;
		var paperSize = stateObj.paperSize;

		var reportTypeOptions = [
			{
				value: 'PDF',
				label: 'PDF'
			}, {
				value: 'XLSX',
				label: 'Excel Sheet'
			}
		];

		var pdfSizesOptions = [];
		pdfSizesOptions.push({
			value: 'Custom',
			label: 'Custom',
			style: {
				color: 'white', 
				backgroundColor: '#4779ac'
			}
		});

		pdfSizes.map(function (item) {
			pdfSizesOptions.push({
				value: item.value,
				label: item.label
			})
		});

		var paperOrientation = stateObj.paperOrientation;

		return (
			<div ref="container" style={{padding: '15px'}}>
				<TopLoader data={stateObj.loaderArr}/>
				<div className='row'>
					<div className='col-sm-4'>
						<div className='row'>
							<div className='col-sm-12'>
								<TextField
									floatingLabelText="Report Title"
									value={stateObj.reportTitle}
									onChange={this._onReportTitleChange}
									style={{
							        	width: '100%'
							        }}
							    />
							</div>

							<div className='col-sm-12'>
							    <SelectField
						        	floatingLabelText={"Report Type"}
						          	value={reportType}
						          	onChange={self._onReportTypeChange}
				          			selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
				          			style={{
							        	width: '100%'
							        }}
							        options={reportTypeOptions}
						        />
							</div>
						</div>
					</div>

					<div className='col-sm-8' style={{marginBottom: '15px'}}>
						<div className='row'>
							<div className='col-sm-12'>
		    					<h4 style={{textAlign: 'center', borderBottom: '1px solid #ccc', paddingBottom: '5px'}}>Table Style</h4>
		    					{tableStyleOptions.map((i) => {
		    						var key = i.key;

		    						if (i.type == 'text') {
		    							return (
		    								<TextField
												key={key}
												floatingLabelText={i.label}
												value={stateObj[key]}
												onChange={(e, value) => {
													this.setState({[key]: value})
												}}
												style={{
										        	width: '100%'
										        }}
										    />
		    							);
		    						} else {
			    						return (
											<Checkbox
												key={key}
											    label={i.label}
											    labelPosition="right"
											    checked={stateObj[key] ? true : false}
											    onCheck={(e, value) => {
													self.setState({
														[key]: !!!self.state[key]
													});
											    }}
											    style={{
											    	whiteSpace: 'nowrap'
											    }}
											    />
			    						);	
		    						}
		    					})}
							</div>

							
						</div>
					</div>
				</div>

				{/*<div style={{visibility: reportType ? 'visible' : 'hidden'}}>*/}
				<div style={{display: reportType ? 'block' : 'none'}} className="row">
	    			<div className='col-sm-4' style={{visibility: PDFSelected ? 'visible' : 'hidden'}}>
	    				<SelectField
				        	floatingLabelText={"Paper Size"}
				          	value={paperSize}
				          	onChange={self._onPaperSizeChange}
					        style={{
					        	width: '100%'
					        }}
		          			selectedMenuItemStyle={{color: 'rgb(125, 190, 125)'}}
		          			options={pdfSizesOptions}
				        />				       

				        {paperSize == 'Custom' ?
				        	<div className='row'>
				        		<div className='col-sm-6'>
				        			<TextField
										floatingLabelText="Width (mm)"
										value={stateObj.paperWidth}
										name='paperWidth'
										onChange={this._onDimensionChange}
										style={{width: '100%', whiteSpace: 'pre'}}
								    />
				        		</div>

				        		<div className='col-sm-6'>
				        			<TextField
										floatingLabelText="Height (mm)"
										value={stateObj.paperHeight}
										name='paperHeight'
										onChange={this._onDimensionChange}
										style={{width: '100%', whiteSpace: 'pre'}}
								    />
				        		</div>

				        		<div className='col-sm-12' style={{marginTop: '15px'}}>
				        			<Checkbox
										label={"Portrait"}
										checked={paperOrientation == 'Portrait' ? true : false}
										onCheck={(e, value) => {
											if (value) {
												stateObj.paperOrientation = 'Portrait';
											} else {
												stateObj.paperOrientation = '';
											}
											self.forceUpdate();
										}}
										style={{
											whiteSpace: 'nowrap'
										}}
									    />

									<Checkbox
										label={"Landscape"}
										checked={paperOrientation == 'Landscape' ? true : false}
										onCheck={(e, value) => {
											if (value) {
												stateObj.paperOrientation = 'Landscape';
											} else {
												stateObj.paperOrientation = '';
											}
											self.forceUpdate();
										}}
										style={{
											whiteSpace: 'nowrap'
										}}
									    />
								</div>
							</div>
								:
							null
						}
	    			</div>
	    			<div className={PDFSelected ? 'col-sm-8' : 'col-sm-8'}>
	    				<div className='text-center'>
	    					<h4 style={{borderBottom: '1px solid #ccc', paddingBottom: '5px'}}>Fields <small>(to show)</small></h4>
	    				</div>

	    				<div style={{margin: '6px 0px 12px'}}>
	    					<RaisedButton
			        			label="Select All"
			        			onClick={this._selectAll}
			        			style={{
			        				margin: '0px 20px',
									border: '1px solid #ccc'
			        			}}
			        			labelStyle={{
			        				color: 'black'
			        			}}
			        			backgroundColor={'#e9eaf8'}
			        			className='btn'
						    />
						    <RaisedButton
			        			label="Select None"
			        			onClick={this._selectNone}
			        			style={{
			        				margin: '0px 20px',
									border: '1px solid #ccc'
			        			}}
			        			labelStyle={{
			        				color: 'black'
			        			}}
			        			backgroundColor={'#e9eaf8'}
			        			className='btn'
						    />
	    				</div>
	        			{fieldArr.map(function (fieldName, index) {
	        				var item = fields[fieldName];
							return (
								<div key={index} style={{margin: '6px 12px'}}>
									<Checkbox
								      label={item.name}
								      checked={item.selected ? true : false}
								      onCheck={(e, value) => {
										// var stateObj = self.state;
										if (value) {
											item.selected = true;
										} else {
											item.selected = false;
										}
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
