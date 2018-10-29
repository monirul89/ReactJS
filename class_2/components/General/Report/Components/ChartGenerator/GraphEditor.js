import React from 'react';

import BarChart from './Graphs/BarChart';
import PieChart from './Graphs/PieChart';
import BulletChart from './Graphs/BulletChart';
import StackedBarChart from './Graphs/StackedBarChart';

import TopLoader from '../General/TopLoader';
import Modal from '../General/Modal';

import ActionCreator from '../../Actions/ActionCreator';

import ReportStore from '../../Stores/ReportStore';

import commonFunctions from '../../Utils/commonFunctions';

var key_stateKey = {

}

class GraphSelector extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			open: false,
			selectedGraph: null
		}

		this.shouldComponentUpdate = commonFunctions.defaultShouldComponentUpdate;
		this._hideModal = this._hideModal.bind(this);

		this.__availableGraphs = [
			{name: "Bar Charts", link: './images/graphs/bar-chart.png'},
			{name: "Pie Charts", link: './images/graphs/pie-chart.png'},
			{name: "Bullet Charts", link: './images/graphs/bullet-charts.jpg'},
			{name: "Stacked Bars", link: './images/graphs/stacked-bars.jpg'},
			/*{name: "Box Plots", link: './images/graphs/box-plots.png'},
			{name: "Bubble Charts", link: './images/graphs/bubble-charts.png'},
			{name: "Calendar View", link: './images/graphs/calendar-view.png'},
			{name: "Non-Continous Cartogram", link: './images/graphs/non-continuous-cartogram.jpg'},
			{name: "Chord Diagram", link: './images/graphs/chord-diagram.jpg'},
			{name: "Dendrogram", link: './images/graphs/dendogram.png'},
			{name: "Force-Directed Graph", link: './images/graphs/force-directed-graph.png'},
			{name: "Circle Packing", link: './images/graphs/circle-packing-graph.png'},
			{name: "Population Pyramid", link: './images/graphs/population-pyramid.png'},
			{name: "Streamgraph", link: './images/graphs/stream-graph.png'},
			{name: "Sunburst", link: './images/graphs/sunburst.jpg'},
			{name: "Node-Link Tree", link: './images/graphs/node-link-tree.jpg'},
			{name: "Treemap", link: './images/graphs/tree-map.jpg'},
			{name: "Voronoi Diagram", link: './images/graphs/voronoi-diagram.png'}*/
		];
	}

	componentWillReceiveProps (nextProps) {
		this.__denyUpdate = true;
	}

	componentDidUpdate (prevProps, prevState) {
		if (prevState.selectedGraph === null && this.state.selectedGraph !== null && !this.state.open) {
			setTimeout(this.setState.bind(this, {open: true}));
		}
	}

	_hideModal () {
		var self = this;
		this.refs['modal'].setState({open: false}, function () {
			setTimeout(function () {
				self.setState({selectedGraph: null, open: false});
			}, 200);
		});
	}

	render () {
		var self = this;
		var stateObj = this.state;
		var selectedGraph = stateObj.selectedGraph;

		if (selectedGraph === null) {
			return null;
		} else {
			return (
				<Modal
					ref="modal"
					open={stateObj.open}
					onHideRequest={this._hideModal}
					innerContainerStyle={{
						maxWidth: '90%',
						width: '1200px'
					}}
					style={{
						paddingBottom: '80px'
					}}
					>

					<div className="row" style={{padding: '30px'}}>
						{this.__availableGraphs.map(function (item, index) {
							return (
								<div key={index} className="col-sm-4" style={{clear: index % 3 == 0 ? "both" : "none", padding: '22px', height: '300px'}}>
									<div 
										onClick={() => {
											self.setState({selectedGraph: item})
										}} 
										style={{
											width: '100%',
											height: '100%',
											border: '2px solid ' + (item === selectedGraph ? "#55a29f" : 'transparent'), 
											padding: '5px', 
											borderRadius: '3px'
										}}>
										<h4>{item.name}</h4>
										<img src={item.link} style={{width: '200px', maxHeight: '200px'}}/>
									</div>
								</div>
							);
						})} 
					</div>
					<div 
						style={{
							position: 'absolute',
							bottom: '0px',
							height: '80px',
							width: '100%',
							backgroundColor: '#fffbfb',
							borderTop: '1px solid #875d48'
						}}>

						<button
							className="btn btn-primary"
							style={{
								float: 'right',
								margin: '25px'
							}}
							onClick={() => {
								stateObj.onSave(stateObj.selectedGraph);
								this._hideModal();
							}}
							>
							Select
						</button>
					</div>
				</Modal>
			);
		}
	}
}

var getNewState = function () {
	return {
		selectedGraph: {},
		loaderArr: [],
		utilityLoadState: 0
	};
}

export default class GraphEditor extends React.Component {
	constructor (props) {
		super(props);

		this.state = getNewState();
		
		this._showAvailableGraphs = this._showAvailableGraphs.bind(this);
		this._changeHandler = this._changeHandler.bind(this);
		//this.validate = this.validate.bind(this);
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
		ReportStore.addChangeListener(this._changeHandler);
		var self = this;
		//var script = document.head.querySelector("script[data-component-name=D3V3]");
		var utilityLoadState = ReportStore.getGraphUtilityLoadState();
        if (!utilityLoadState) {
            ActionCreator.setGraphUtilityLoadState(1);

        	var rootSrc = './js/d3.v3.min.js';
        	var src = rootSrc.split('/');

        	if (process.env.NODE_ENV == 'production') {
	        	src.splice(src.length - 1, 0, 'jszipped');
	        	src[src.length - 1] += '.jpg';
        	}

        	src = src.join('/');
        	var callBack = function (content, resource) {
                var script = document.createElement('script');
        		script.dataset.componentName = 'D3V3';
                script.type = "text/javascript";
                script.dataset.rootSrc = rootSrc;
                script.innerHTML = content;
                
                document.head.appendChild(script);

                ActionCreator.setGraphUtilityLoadState(2);
            }

        	var xhr = new XMLHttpRequest();
            if (process.env.NODE_ENV == 'production') {
	            xhr.responseType = 'arraybuffer';
            } else {

            }
            xhr.open("GET", src);
            xhr.onprogress = onprogress || null;
            
            xhr.onload = function (e) {
                if (this.status == 200) {
                	if (process.env.NODE_ENV !== 'production') {
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
        } else {
        	ActionCreator.setGraphUtilityLoadState(utilityLoadState);
        }
	}

	componentWillUnmount () {
		ReportStore.removeChangeListener(this._changeHandler);
	}


	componentDidUpdate () {

	}

	_showAvailableGraphs () {
		// Will show the available graphs in the modal here

		var self = this;

		this.refs['graph-selector'].setState({
			selectedGraph: this.state.selectedGraph,
			onSave: function (selectedGraph) {
				self.setState({
					selectedGraph: selectedGraph
				});
			}
		})
	}

	_changeHandler () {
		var utilityLoadState = ReportStore.getGraphUtilityLoadState();
		if (this.state.utilityLoadState != utilityLoadState) {
			var newState = {utilityLoadState: utilityLoadState};
			if (utilityLoadState == 2) {
				newState.loaderArr = this.getLoaderArr({
    				id: 'loadGraphUtilities'
    			}, 'delete');
			} else if (utilityLoadState == 1) {
				newState.loaderArr = this.getLoaderArr({
        			state: 'loading',
        			title: 'Loading Converter',
        			id: 'loadGraphUtilities'
        		})
			}

			this.setState(newState);
		}
	}

	// validate () {
	// 	// Report and Application name should be provided
	// 	// Each of the Column should have a Module and a Field Name, rest of the options are not mandatory

	// 	return true; // false if data fields are invalid
	// }

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

		var selectedGraph = stateObj.selectedGraph;
		var graphName = selectedGraph.name || "";

		return (
			<div ref="container" style={{position: 'relative', paddingTop: '15px'}}>
				<TopLoader data={stateObj.loaderArr} />

				<GraphSelector ref="graph-selector"/>

				<div>
					<div style={{margin: '6px 0px'}}>
						<label>Graph</label>
						<input onClick={this._showAvailableGraphs} className="form-control" value={graphName}/>

						<div data-options>

						</div>
					</div>

					{function () {
						if (stateObj.utilityLoadState != 2) graphName = "!!Deny!!";
						switch (graphName) {
							case "Bar Charts":
								return <BarChart Did={props.Did}/>;

							case "Pie Charts":
								return <PieChart Did={props.Did}/>;

							case "Bullet Charts":
								return <BulletChart Did={props.Did}/>;

							case "Stacked Bars":
								return <StackedBarChart Did={props.Did}/>;

							default:
								return null;
						}
					}()}
				</div>
				
			</div>
		)
	}
}
