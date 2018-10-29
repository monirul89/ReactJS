import React from 'react';

import { IconRemove, IconPopOut } from './Icons';

var constructFile = function (file) {
	if (file) {
		// var type = file.type || "application/pdf";
		var type = file.type || null;
		var newURL = file.url || URL.createObjectURL(file);
		return {
			type: type,
			url: newURL
		}
	} else return {};
}

export default class FileViewer extends React.Component {
	constructor (props) {
		super(props);

		var self = this;

		var file = props.file;
		var viewMode = file ? true : false;
		this.state = {
			viewMode: viewMode,
			file: constructFile(file)
		};

		[
            'showFile',
            '_closeViewer',
            '_popUpFile'
        ].map(function (fn) {
            self[fn] = self[fn].bind(self);
        })
	}

	showFile (data) {
		var file = data.file;
		var viewMode = file ? true : false;
		this.setState({
			viewMode: viewMode,
			file: constructFile(file)
		})
	}

	// componentWillReceiveProps (nextProps) {
	// 	var file = nextProps.file;
	// 	var viewMode = file ? true : false;
	// 	this.setState({
	// 		viewMode: viewMode,
	// 		file: constructFile(file)
	// 	})
	// }

	_closeViewer (e) {
		URL.revokeObjectURL(this.state.file.url);
		this.setState({
			viewMode: false,
			file: {}
		})
	}

	_popUpFile (e) {
		var newWindow = window.open();
		var newBody = newWindow.document.body;
		var file = this.state.file;
		newBody.style.cssText = "background-color: grey; display: flex; justify-content: center; overflow: hidden; height: 100%; margin: 0px";
		var newIframe = document.createElement('iframe');
		newIframe.src = file.url;
		newIframe.style.cssText = "width: 100%; height: 100%; background-color: white; border: none";
		newIframe.addEventListener('load', this._closeViewer);
		newBody.appendChild(newIframe);
	}

	render () {
		var stateObj = this.state;
		var file = stateObj.file;
		var viewerStyle = {};
		var viewMode = stateObj.viewMode;
		if (viewMode) {
			viewerStyle = {visibility: 'visible', opacity: "1"};
			document.body.style.overflow = "hidden";
		} else {
			viewerStyle = {visibility: 'hidden', opacity: "0"};
			document.body.style.removeProperty('overflow');
		}

		return (
			<div className="custom-pdf-viewer" style={viewerStyle}>
				<div
					style={{
						position: 'absolute', 
						right: '32px', 
						top: '12px',
						padding: '8px'
					}}
					>
					<IconRemove style={{fill: 'white', transform: 'scale(1.5)'}}/>
					{/* Following portion is a work-around to execute click functionalities properly */}
					<div onClick={this._closeViewer} style={{width: '100%', height: '100%', position: 'absolute', zIndex: 5, cursor: 'pointer', left: '0px', top: '0px'}}></div>
				</div>
		        {/*<i onClick={this._closeViewer} className="fa fa-times pointer btn" style={{position: 'absolute', right: '40px', top: '20px', fontSize: '1.8em', color: 'white'}}></i>*/}
		        <div style={{width: '100%', position: 'absolute', left: '0px', top: '0px', height: '30px', textAlign: 'center'}}>
		            <button className="btn btn-sm btn-default" onClick={this._popUpFile}>
		            	<IconPopOut style={{width: '18px', height: '18px', fill: '#000'}} /> New Window
		            </button>
		        </div>
		        {file.url ? <object data={file.url} type={file.type || null} style={{width: '60%', height: '90%', backgroundColor: 'white'}}></object> : null}
		    </div>
		);
	}
}