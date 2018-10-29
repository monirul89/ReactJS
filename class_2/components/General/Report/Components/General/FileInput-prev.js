import React from 'react';

class IconAdd extends React.Component {
	constructor (props) {
		super(props);
	}

	render () {
		return (
			<svg 
				viewBox="0 0 24 24" 
				style={{
					display: 'inline-block',
					color: 'rgb(255, 255, 255)',
					fill: 'rgb(255, 255, 255)',
					height: '22px',
					width: '24px',
					userSelect: 'none',
					transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
					verticalAlign: 'middle'
				}}>
				<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
			</svg>
		);

	}
}

var FileInputObj = {};
export default class FileInput extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			file: null,
			fileName: this.props.fileName || "",
			fileURL: this.props.fileURL || ""
		}

		this._changeHandler = this._changeHandler.bind(this);
		this._removeFile = this._removeFile.bind(this);
		FileInputObj = this;
	}

	_changeHandler (e) {
		var file = e.target.files[0];
		var fileName = file.name;

		var accept = this.props.accept;

		if (accept && accept.find(function(item) {
			var regex = new RegExp(item + "$", "i");
			return fileName.search(regex) > -1;
		})) {
			this.setState({
				fileName: "Accepted type(s): " + this.props.accept.toString()
			})
			return;
		}

		this.setState({
			file: file,
			fileName: fileName,
			fileURL: window.URL.createObjectURL(file)
		})

		if (this.props.onChange) this.props.onChange(file);
	}

	_addHandler (e) {
		alert('i was invoked');
	}

	_removeFile (e) {
		this.setState({
			clearFile: true
		}, function () {
			this.setState({
				file: null,
				fileName: "",
				fileURL: "",
				clearFile: false
			})
		})

		if (this.props.onChange) this.props.onChange(null);
	}

	render () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;
		var fileContainerStyle = {
			minHeight: '200px',
			borderRadius: '6px 6px 0px 0px',
			border: '1px #ccc solid',
			borderBottom: 'none',
			padding: '15px'
		}

		var file = stateObj.file || {};
		var fileType = file.type || "";
		if (!fileType)  {
			var fileName = file.name || "";
			fileName = fileName.split(".");
			fileType = "application/" + fileName[fileName.length - 1];
		}

		fileContainerStyle.display = this.state.fileURL ? "block" : "none";

		return (
			<div>
				<div style={fileContainerStyle}>
					<object style={{height: '200px'}} data={this.state.fileURL} type={fileType}/>
				</div>
				<div className="input-group">
					<div className="form-control" style={{zIndex: 3}}>
						{this.state.fileName}
					</div>
					<div className="input-group-btn">
						<div className="btn btn-default btn-file" style={{display: this.state.fileURL ? "inline-block" : "none", zIndex: 4, height: '34px', lineHeight: '16px'}} onClick={this._removeFile}>
							<i className="fa fa-remove" style={{verticalAlign: 'middle', fontSize: '1.2em', lineHeight: "22px"}}></i>
							<span className="hidden-xs" style={{marginLeft: '3px', verticalAlign: 'middle', lineHeight: "22px"}}> Remove</span>
						</div>

						<div className="btn btn-primary btn-file" style={{height: '34px', lineHeight: '16px', position: 'relative', zIndex: 3}}>
							<i className={"fa fa-" + (this.state.fileURL ? "edit" : "folder-open")} style={{verticalAlign: 'middle', fontSize: '1.2em', lineHeight: '22px'}}></i>
							<span className="hidden-xs" style={{marginLeft: '3px', verticalAlign: 'middle', display: 'inline-block', lineHeight: "22px"}}> {this.state.fileURL ? "Change" : "Browse"}</span>
							<input onChange={this._changeHandler} type={this.state.clearFile ? "hidden" : "file"} className="file" />
						</div>

						{/*<div className="btn btn-success btn-file" style={{height: '34px', lineHeight: '16px', position: 'relative', zIndex: 2}}>
							<IconAdd />
							<span className="hidden-xs" style={{marginLeft: '3px', verticalAlign: 'middle', display: 'inline-block', lineHeight: "21px"}}> Add</span>
							<input onChange={this._addHandler} type={this.state.clearFile ? "hidden" : "file"} className="file" />
						</div>*/}

					</div>
				</div>
			</div>
		);
	}
}