import React from 'react';

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
		xAxisValue_primary: "",
		xAxisValue_secondary: "",
		yAxisValue: "",
		xAxisGrouped: true,
		loaderArr: []
	};
}

export default class StackedBarChart extends React.Component {
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
		var sbcStyleElem = document.head.querySelector("[data-component-name=StackedBarChart]"); // sbc => StackedBarChart
		if (!sbcStyleElem) {
			var styleElem = document.createElement('style');
			styleElem.dataset.componentName = "StackedBarChart";
			styleElem.innerHTML = 'svg{shape-rendering:crispEdges}.axis line,.axis path{fill:none;stroke:#000}path.domain{stroke:none}.y .tick line{stroke:#ddd}';
			document.head.appendChild(styleElem);
		} else {
			sbcStyleElem.disabled = false;
		}
	}

	componentWillUnmount () {
		var sbcStyleElem = document.head.querySelector("[data-component-name=StackedBarChart]");
		if (sbcStyleElem) sbcStyleElem.disabled = true;
	}


	componentDidUpdate () {

	}

	_generateGraph () {
		var self = this;
		var stateObj = this.state;

		var reportObj = ReportStore.getCurrentReport();

		var data = [];
		var fields = {};

		var xAxisValue_primary = stateObj.xAxisValue_primary;
		var xAxisValue_secondary = stateObj.xAxisValue_secondary;
		var yAxisValue = stateObj.yAxisValue;

		if (!xAxisValue_primary || !xAxisValue_secondary || !yAxisValue) {
			alert('Please fill up all the input box!');
			return;
		}

		var queryData = {
			moduleName: reportObj.ModuleName
		}

		if (stateObj.xAxisGrouped) {
			queryData.group = {
				_id: {
					"Field_1": "$" + xAxisValue_primary,
					"Field_2": "$" + xAxisValue_secondary
				},
				'0': {
					$first: '$' + xAxisValue_primary
				},
				'1': {
					$first: '$' + xAxisValue_secondary
				},
				'2': {
					$push: "$" + yAxisValue
				} 
			}

			queryData.orderBy = {
				"0": 1
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

					JSON.parse(res.Data).map(function (item) {
					    var lastItem;
					    if (data.length) {
					        lastItem = data[data.length - 1];
							if (item[0] == lastItem.xAxisValue) {
					            
					        } else {
					            lastItem = {
					                xAxisValue: item[0]
					            };
					            data.push(lastItem);
					        }
					    } else {
					        lastItem = {
					            xAxisValue: item[0]
					        }
					        data.push(lastItem);
					    }
					    
					    var yVal = 0;
					    item[2].map(function (i) {
					  		var v = parseFloat(i);
							if (!isNaN(v)) {
								yVal += v;
					        }
						})

						fields[item[1]] = true;
					    
					    lastItem[item[1]] = yVal;
					})


				} else {

					alert('Please check the console!');
					console.warn('No support for ungrouped values yet!');

					var _data = res.Data;
					_data.map(function (item) {
						var y = parseFloat(item[yAxisValue]);
						if (isNaN(y)) y = 0;
						data.push({x: item[xAxisValue], y: y});
					})
				}

				fields = Object.keys(fields);
				populateGraph();

				self.setState({
					loaderArr: self.getLoaderArr({id: 'getGraphData'}, 'delete')
				})
			}
		})

		var populateGraph = function () {
			var chartContainer = document.querySelector('#chart-container');
			chartContainer.innerHTML = "";

			var margin = {top: 20, right: 160, bottom: 35, left: 80};

			//var width = data.length * 111 - margin.left - margin.right,
			var width = data.length * 120,
			    height = 500 - margin.top - margin.bottom;

			var svg = d3.select("#chart-container")
			  .append("svg")
			  .attr("width", width + margin.left + margin.right)
			  .attr("height", height + margin.top + margin.bottom)
			  .append("g")
			  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			var dataset = d3.layout.stack()(fields.map(function(field) {
			  	return data.map(function(d) {
			    	return {x: d.xAxisValue, y: d[field] || 0};
			  	});
			}));

			// Set x, y and colors
			var x = d3.scale.ordinal()
			  .domain(dataset[0].map(function(d) { return d.x; }))
			  .rangeRoundBands([10, width-10], 0.02);

			var y = d3.scale.linear()
			  .domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d.y0 + d.y; });  })])
			  .range([height, 0]);

			// var _colors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00", '#e37676', '#31ad46', '#638468', '#3abaae', '#427873'];
			var colors = [];
			fields.map(function (item, index) {
				//colors.push(_colors[index]);
				colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
			})



			// Define and draw axes
			var yAxis = d3.svg.axis()
			  .scale(y)
			  .orient("left")
			  .ticks(5)
			  .tickSize(-width, 0, 0)
			  //.tickFormat( function(d) { return d } );

			var xAxis = d3.svg.axis()
			  .scale(x)
			  .orient("bottom")
			  //.tickFormat(d3.time.format("%Y"));

			svg.append("g")
			  .attr("class", "y axis")
			  .call(yAxis);

			svg.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + height + ")")
			  .call(xAxis);


			// Create groups for each series, rects for each segment 
			var groups = svg.selectAll("g.cost")
			  .data(dataset)
			  .enter().append("g")
			  .attr("class", "cost")
			  .style("fill", function(d, i) { return colors[i]; });
			  //.style("fill", function(d, i) { return '#' + Math.floor(Math.random() * 16777215).toString(16); });

			var rect = groups.selectAll("rect")
				.data(function(d) { return d; })
				.enter()
				.append("rect")
				.attr("x", function(d) { return x(d.x); })
				.attr("y", function(d) { return y(d.y0 + d.y); })
				.attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
				.attr("width", x.rangeBand())
				.on("mouseover", function() { tooltip.style("display", null); })
				.on("mouseout", function() { tooltip.style("display", "none"); })
				.on("mousemove", function(d) {
				    var xPosition = d3.mouse(this)[0] - 15;
				    var yPosition = d3.mouse(this)[1] - 25;
				    tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
				    tooltip.select("text").text(d.y);
			  	});


			// Draw legend
			var legend = svg.selectAll(".sbc-legend")
			  .data(colors)
			  .enter().append("g")
			  .attr("class", "sbc-legend")
			  .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });
			 
			legend.append("rect")
			  .attr("x", width - 18)
			  .attr("width", 18)
			  .attr("height", 18)
			  .style("fill", function(d, i) {return colors.slice().reverse()[i];});
			  //.style("fill", function(d, i) { return '#' + Math.floor(Math.random() * 16777215).toString(16); });
			 
			legend.append("text")
			  .attr("x", width + 5)
			  .attr("y", 9)
			  .attr("dy", ".35em")
			  .style("text-anchor", "start")
			  .text(function(d, i) { 
			    return fields[i];
			  });


			// Prep the tooltip bits, initial display is hidden
			var tooltip = svg.append("g")
			  .attr("class", "sbc-tooltip")
			  .style("display", "none");
			    
			/*tooltip.append("rect")
			  .attr("width", 30)
			  .attr("height", 20)
			  .attr("fill", "white")
			  .style("opacity", 0.5);
			*/
			
			tooltip.append("text")
			  .attr("x", 15)
			  .attr("dy", "1.2em")
			  .style("text-anchor", "middle")
			  .attr("font-size", "12px")
			  .attr("font-weight", "bold");


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
				<Loader data={stateObj.loaderArr} />

				<div style={{margin: '6px 0px'}}>
					<label>X-Axis (Primary)</label>
					<select 
						className="form-control"
						onChange={(e) => {
							self.setState({
								xAxisValue_primary: e.target.value
							})
						}}
						value={stateObj.xAxisValue_primary}
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
					<label>X-Axis (Secondary)</label>
					<select 
						className="form-control"
						onChange={(e) => {
							self.setState({
								xAxisValue_secondary: e.target.value
							})
						}}
						value={stateObj.xAxisValue_secondary}
						>
						<option value="">--SELECT--</option>
						{fields.map(function (item) {
							return (
								<option key={item.value} value={item.value}>{item.label}</option>
							);
						})}
					</select>

					<div data-options style={{margin: '7px 0px'}}>

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

				<div id="chart-container" style={{width: '100%', overflow: 'auto'}}>

				</div>

			</div>
		)
	}
}
