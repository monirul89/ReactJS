import React from 'react';

//import TopLoader from '../../../General/TopLoader';
import Loader from '../../General/Loader';

//import ModuleStore from "../../Stores/ModuleStore";
import ReportStore from "../../../Stores/ReportStore";
//import PermissionStore from "../../Stores/PermissionStore";

import ServerAPI from '../../../Utils/ServerAPI';
import commonFunctions from '../../../Utils/commonFunctions';

var key_stateKey = {

}

var getNewState = function () {
	return {
		xAxisValue: "",
		yAxisValue: "",
		xAxisGrouped: true,
		loaderArr: []
	};
}

export default class BarChart extends React.Component {
	constructor (props) {
		super(props);

		this.state = getNewState();
		
		var reportDetailsObj = ReportStore.getSpecificReportDetails(props.Did);
		var fields = [];

		(reportDetailsObj.Structure || []).map(function (item) {
			if (item.HideColumn != '1') {
				var newRow = {
					label: item.ShowAs,
					value: item.Field
				};

				/*if (item.ShowAs) {
					fields.push(item.ShowAs);
				} else if (item.Module) {
					if (item.Field) {
						fields.push(item.Module + "." + item.Field);
					}
				}*/
				fields.push(newRow);
			}
		})
		this.__fields = fields;


		this._generateGraph = this._generateGraph.bind(this);
		this.validate = this.validate.bind(this);
		this.getQueryRelatedObj = this.getQueryRelatedObj.bind(this);
		this.getLoaderArr = this.getLoaderArr.bind(this);

		this.shouldComponentUpdate = commonFunctions.defaultShouldComponentUpdate;

		// We have to attach other existing query parameters too in the href..
		this.__prevData = {};

		Object.assign(this.state, this.getQueryRelatedObj());
	}

	getQueryRelatedObj () {
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

	componentWillReceiveProps (nextProps) {
		/*var keyValuePair = this.getQueryRelatedObj();

		if (Object.keys(keyValuePair).length) {
			this.setState(keyValuePair);
		} else {
			this.__denyUpdate = true;
		}*/

		var props = this.props;
		if (Object.keys(props).find(function (key) {
			return props[key] != nextProps[key];
		})) {
			this.setState(getNewState(), this.getReportInformation);
		} else {
			this.__denyUpdate = true;
		}

	}

	componentDidMount () {
		
	}

	componentWillUnmount () {
	}


	componentDidUpdate () {

	}

	_generateGraph () {
		var self = this;
		var stateObj = this.state;

		var reportObj = ReportStore.getCurrentReport();

		var data = [];

		var xAxisValue = stateObj.xAxisValue;
		var yAxisValue = stateObj.yAxisValue;

		if (!xAxisValue || !yAxisValue) {
			alert('Please fill up all the input box!');
			return;
		}

		var queryData = {
			moduleName: reportObj.ModuleName
		}

		if (stateObj.xAxisGrouped) {
			queryData.group = {
				_id: '$' + xAxisValue,
				'0': {
					$first: '$' + xAxisValue
				},
				'1': {
					$push: "$" + yAxisValue
				} 
			}
		} else {
			queryData.optimize = true;

			queryData.select = [xAxisValue, yAxisValue];

			// Configuring it later!!
		}

		self.setState({
			loaderArr: self.getLoaderArr({
				id: 'getGraphData',
				title: 'Pulling Graph Data!',
				state: 'loading'
			})
		})

		ServerAPI.aggregate(queryData, function (res) {

			if (res.Status == "Success") {
				if (stateObj.xAxisGrouped) {
					var _data = JSON.parse(res.Data);
					_data.map(function (item) {
						var yVal = 0;
						item[1].map(function (i) {
							var v = parseFloat(i);
							if (!isNaN(v)) {
								yVal += v;
							}
						})
						data.push({x: item[0], y: yVal});
					})
				} else {
					var _data = res.Data;
					_data.map(function (item) {
						var y = parseFloat(item[yAxisValue]);
						if (isNaN(y)) y = 0;
						data.push({x: item[xAxisValue], y: y});
					})
				}

				populateGraph();

				self.setState({
					loaderArr: self.getLoaderArr({id: 'getGraphData'}, 'delete')
				})
			}
		})

		var populateGraph = function () {

			var svgChart = document.querySelector('.chart');
			//svgChart.removeAttribute('width');
			//svgChart.removeAttribute('height');
			svgChart.innerHTML = "";

			// Dynamically adjust x-axis values width

			//var margin = {top: 20, right: 30, bottom: 30, left: 40},
			var margin = {top: 20, right: 30, bottom: 30, left: 100},
			    //width = data.length * (data.length < 5 ? 200 : 20) - margin.left - margin.right,
			    width = data.length * (data.length < 5 ? 200 : 100) - margin.left - margin.right,
			    height = 500 - margin.top - margin.bottom;

			var x, y;
			var barWidth = 0;

			x = d3.scale.ordinal()
		    	.rangeRoundBands([0, width], 0.2);

			y = d3.scale.linear()
		    	.range([height, 0]);

			var xAxis = d3.svg.axis()
			    .scale(x)
			    .orient("bottom");

			var yAxis = d3.svg.axis()
			    .scale(y)
			    .orient("left");

			var chart = d3.select(".chart")
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			  	.append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				x.domain(data.map(function (d) { return d.x; }));
				barWidth = x.rangeBand();

				y.domain([0, d3.max(data, function (d) { return d.y; })]);

				chart.append("g")
				  .attr("class", "x axis")
				  .attr("transform", "translate(0," + height + ")")
				  .call(xAxis);

				chart.append("g")
				  .attr("class", "y axis")
				  .call(yAxis);

				chart.selectAll(".bar")
				  .data(data)
				.enter().append("rect")
				  .attr("class", "bar")
				  .attr("x", function(d) {return x(d.x); })
				  .attr("y", function(d) { return y(d.y); })
				  .attr("height", function(d) { return height - y(d.y); })
				  .attr("width", barWidth);
		}
	}

	validate () {
		// Report and Application name should be provided
		// Each of the Column should have a Module and a Field Name, rest of the options are not mandatory

		return true; // false if data fields are invalid
	}

	getLoaderArr (data, type) {
		var type = type == "delete" ? 'delete' : 'add';
		var loaderArr = [];
		var prevLoaderArr = this.state.loaderArr;

		if (!Array.isArray(data)) data = [data];
		if (type == 'delete') {
			prevLoaderArr.map(function (item, index) {
				if (!data.find(function (subItem) {return subItem.id == item.id})) {
					loaderArr.push(item);
				}
			})
		} else {
			loaderArr = prevLoaderArr.concat(data);
		}

		return loaderArr;
	}

	render () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;
		var fields = this.__fields;

		// Convert the common styles to classes!

		var selectedGraph = stateObj.selectedGraph;

		return (
			<div ref="container" style={{position: 'relative', margin: '6px 0px'}}>
				{/*<TopLoader data={stateObj.loaderArr} />*/}
				<Loader data={stateObj.loaderArr} />

				<div style={{margin: '6px 0px'}}>
					<label>X-Axis</label>
					<select 
						className="form-control"
						onChange={(e) => {
							self.setState({
								xAxisValue: e.target.value
							})
						}}
						value={stateObj.xAxisValue}
						>
						<option value="">--SELECT--</option>

						{fields.map(function (item) {
							return (
								<option key={item.value} value={item.value}>{item.label}</option>
							);
						})}
					</select>

					<div data-options style={{margin: '7px 0px'}}>

						{/* X-Axis option - Group! */}

						{/*<div style={{display: 'inline-block'}}>
							<div 
								onClick={(e) => {
									self.state.xAxisGrouped = self.state.xAxisGrouped ? false : true;
									self.forceUpdate();
								}} 
								className="pointer text-center" style={{verticalAlign: 'middle', display: 'inline-block', width: '22px', height: '22px', position: 'relative', borderRadius: '3px', border: '2px solid green', backgroundColor: self.state.xAxisGrouped ? "green" : "white", margin: '0px 12px 0px 0px'}}>
								<i className={self.state.xAxisGrouped ? "fa fa-check" : ""} style={{color: 'white', fontSize: '1.2em', lineHeight: '18px', height: '18px', verticalAlign: 'middle'}}></i>
							</div>
							<label>Group</label>
						</div>*/}

					</div>
				</div>

				<div style={{margin: '6px 0px'}}>
					<label>Y-Axis</label>
					<select 
						className="form-control"
						onChange={(e) => {
							self.setState({
								yAxisValue: e.target.value
							})
						}}
						value={stateObj.yAxisValue}
						>
						<option value="">--SELECT--</option>

						{fields.map(function (item) {
							return (
								<option key={item.value} value={item.value}>{item.label}</option>
							);
						})}
					</select>
				</div>

				<div style={{margin: '6px 0px'}}>
					<button 
						className="btn btn-sm btn-default pull-right"
						onClick={this._generateGraph}
						>
						Generate Graph
					</button>
				</div>

				<div style={{width: '100%', overflow: 'auto'}}>
					<svg className="chart"></svg>
				</div>

			</div>
		)
	}
}
