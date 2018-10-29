import React from 'react';

import TopLoader from '../../General/TopLoader';

//import ModuleStore from "../../Stores/ModuleStore";
import ReportStore from "../../../Stores/ReportStore";
//import PermissionStore from "../../Stores/PermissionStore";

import ServerAPI from '../../../Utils/ServerAPI';
import commonFunctions from '../../../Utils/commonFunctions';

var key_stateKey = {

}

var getNewState = function () {
	return {
		data: [{
			title: "",
		    subtitle: "",
		    ranges: [],
		    measures: [],
		    markers: []
		}],
		loaderArr: []
	};
}

export default class BulletChart extends React.Component {
	constructor (props) {
		super(props);

		this.state = getNewState();
		this.state.utilitiesLoaded = true;
		
		var reportDetailsObj = ReportStore.getSpecificReportDetails(props.Did);
		var fields = [];

		(reportDetailsObj.Structure || []).map(function (item) {
			if (item.HideColumn != '1') {
				if (item.ShowAs) {
					fields.push(item.ShowAs);
				} else if (item.Module) {
					if (item.Field) {
						fields.push(item.Module + "." + item.Field);
					}
				}
			}
		})
		this.__fields = fields;

		this._addItem = this._addItem.bind(this);
		this._removeItem = this._removeItem.bind(this);
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
		var self = this;
        var script = document.head.querySelector("script[data-component-name=Bullet]");
        if (!script) {
        	self.setState({
        		loaderArr: self.getLoaderArr({
        			state: 'loading',
        			title: 'Loading Bullet Chart Utilities',
        			id: 'loadChartUtilities'
        		}),
        		utilitiesLoaded: false
        	})

        	var rootSrc = './js/bullet.min.js';
        	var src = rootSrc.split('/');
        	src.splice(src.length - 1, 0, 'jszipped');
        	src[src.length - 1] += '.jpg';
        	src = src.join('/');
        	var callBack = function (content, resource) {
                var script = document.createElement('script');
        		script.dataset.componentName = 'Bullet';
                script.type = "text/javascript";
                script.dataset.rootSrc = rootSrc;
                script.innerHTML = content;
                
                document.head.appendChild(script);

                self.setState({
        			loaderArr: self.getLoaderArr({
        				id: 'loadChartUtilities'
        			}, 'delete'),
        			utilitiesLoaded: true
        		})
            }

        	var xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';
            xhr.open("GET", src);
            xhr.onprogress = onprogress || null;
            
            xhr.onload = function (e) {
                if (this.status == 200) {
                    JSZip.loadAsync(this.response).then(function (zip) {
                        var files = zip.files;
                        files[Object.keys(files)[0]].async("string").then(function (content) {
                            if (callBack) callBack(content);
                        })
                        
                    });
                } else {
                    alert('download failed!'); // Maybe a retry could be applied
                }
            }
            xhr.send();
        }
	}

	componentWillUnmount () {
	}


	componentDidUpdate () {

	}

	_addItem () {
		var data = this.state.data;
		data.push({
			title: "",
		    subtitle: "",
		    ranges: [],
		    measures: [],
		    markers: []
		})
		this.setState({data: data});
	}

	_removeItem (index) {
		if (index < 0) {
			console.log('Given index is not a valid one, Given Index - ', index);
			return;
		}

		var data = this.state.data;
		if (index > data.length - 1) {
			console.log('The index being referred to is out of range, Given Index - ', index);
			return;
		}

		data.splice(index, 1);
		this.setState({data: data});
	}

	_onValueChange (type, index, e) {
		var targetObj = e.target;
		var key = targetObj.name;
		var value = targetObj.value;

		if (type == 'arr') {
			value = value.split(',');
		} else if (type == 'str') {
			
		} else {
			console.log('No discernible "type" value found!')
			return;
		}

		var data = this.state.data;
		data[index][key] = value;
		this.setState({data: data});

	}

	_generateGraph () {
		var self = this;
		var stateObj = this.state;

		var data = stateObj.data.map(function (i) {
			var item = JSON.parse(JSON.stringify(i));
			['ranges', 'measures', 'markers'].map(function (key) {
				var newVal = item[key];
				newVal.map(function (subItem, subIndex) {
					newVal[subIndex] = parseFloat(subItem.trim());
				})
				item[key] = newVal;
			})
			return item;
		})

		console.log('Newly built data', data);

		var chartContainer = document.querySelector('#chart-container');
		chartContainer.innerHTML = "";

		var margin = {top: 5, right: 40, bottom: 20, left: 120},
    	width = 960 - margin.left - margin.right,
    	height = 50 - margin.top - margin.bottom;

		var chart = d3.bullet()
		    .width(width)
		    .height(height);

		var svg = d3.select("#chart-container").selectAll("svg")
			      .data(data)
			    .enter().append("svg")
			      .attr("class", "bullet")
			      .attr("width", width + margin.left + margin.right)
			      .attr("height", height + margin.top + margin.bottom)
			    .append("g")
			      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			      .call(chart);

		var title = svg.append("g")
		  	.style("text-anchor", "end")
		  	.attr("transform", "translate(-6," + height / 2 + ")");

		title.append("text")
		  	.attr("class", "title")
		  	.text(function(d) { return d.title; });

		title.append("text")
		  	.attr("class", "subtitle")
		  	.attr("dy", "1em")
		    .text(function(d) { return d.subtitle; });
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

		/*

			Bullet chart will take the following parameters from the user

			[
			 	{
				    "title":"CPU 1 Load",
				    "subtitle":"GHz",
				    "ranges":[1500,2250,3000],
				    "measures":[2200],
				    "markers":[2500]
			  	}
			]

		*/

		return (
			<div ref="container" style={{position: 'relative', margin: '6px 0px'}}>
				{/*<TopLoader data={stateObj.loaderArr} />*/}

				<div>
					{stateObj.data.map(function (item, index) {
						return (
							<div key={index} style={{margin: '12px 0px', float: 'left', width: '100%'}}>
								<button
									className="btn"
									style={{
										position: 'relative',
										float: 'right',
										right: '0px',
										top: '0px',
										background: 'linear-gradient(rgb(223, 108, 108) 0%, rgb(142, 34, 34) 50%, rgb(113, 32, 32) 99%)',
										border: '1px solid #ccc',
										padding: '1px 6px',
										color: 'white',
										outline: 'none',
										margin: '5px 4px'
									}}
									onClick={self._removeItem.bind(self, index)}
								>
									<i className="fa fa-times"></i>
								</button>
								{/*<label>Title</label>*/}
								<input className="form-control" style={{margin: '8px 0px'}} placeholder="Title" value={item.title} name="title" onChange={self._onValueChange.bind(self, 'str', index)}/>
								<input className="form-control" style={{margin: '8px 0px'}} placeholder="Sub-title" value={item.subtitle} name="subtitle" onChange={self._onValueChange.bind(self, 'str', index)}/>
								<input className="form-control" style={{margin: '8px 0px'}} placeholder="Ranges" value={item.ranges.toString()} name="ranges" onChange={self._onValueChange.bind(self, 'arr', index)}/>
								<input className="form-control" style={{margin: '8px 0px'}} placeholder="Measures" value={item.measures.toString()} name="measures" onChange={self._onValueChange.bind(self, 'arr', index)}/>
								<input className="form-control" style={{margin: '8px 0px'}} placeholder="Markers" value={item.markers.toString()} name="markers" onChange={self._onValueChange.bind(self, 'arr', index)}/>
							</div>
						);
					})}
				</div>

				<div style={{display: 'inline-block'}}>
					<button
						className="btn"
						style={{
							position: 'relative',
							float: 'right',
							right: '0px',
							top: '0px',
							background: 'linear-gradient(rgb(147, 229, 168) 0%, rgb(128, 202, 122) 50%, rgb(148, 207, 140) 99%)',
							border: '1px solid #ccc',
							padding: '1px 6px',
							color: 'white',
							outline: 'none',
							margin: '5px 4px'
						}}
						onClick={this._addItem}
					>
						<i className="fa fa-plus" style={{verticalAlign: 'middle'}}></i>
					</button>
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
