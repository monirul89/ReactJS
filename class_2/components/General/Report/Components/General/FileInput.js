import React from 'react';

class IconAdd extends React.Component {
	constructor (props) {
		super(props);
	}

	render () {
		var props = this.props;
		return (
			<svg 
				viewBox="0 0 24 24" 
				style={Object.assign({
					display: 'inline-block',
					color: 'rgb(255, 255, 255)',
					fill: 'rgb(255, 255, 255)',
					height: '24px',
					width: '24px',
					userSelect: 'none',
					transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
					verticalAlign: 'middle'
				}, props.style || null)}>
				<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
			</svg>
		);

	}
}

var getFileObj = function (props) {
	var fileList = props.fileList;
	var internalFileList = [];
	if (fileList) {
		if (!Array.isArray(fileList)) {
			fileList = [fileList];
		}
	} else {
		fileList = [];
	}

	fileList.map(function (file, index) {
		var data = "", name = "File - " + (index + 1), type = "", size = 0;
		if (typeof file == "string") {
			data = file;
			if (!file.search(/^blob/)) {

			} else {
				var split_file = file.split('/');
				name = split_file[split_file.length - 1];
				//var split_name = name.split(".");
				//type = split_name[split_name.length - 1];
				//type = type ? "application/" + type : "";
				type = null;
			}

			size = 1; // settting size like this so that it is rendered on the window - for now!
		} else {
			data = window.URL.createObjectURL(file);
			name = file.name || name, type = file.type, size = file.size;
		}
		
		internalFileList.push({data: data, name: name, type: type || props.defaultType || null, size: size});
	})

	return ({
		fileList: fileList,
		internalFileList: internalFileList
	})
}

export default class FileInput extends React.Component {
	constructor (props) {
		super(props);

		var fileList = props.fileList;
		if (fileList) {
			if (!Array.isArray(fileList)) {
				fileList = [fileList];
			}
		} else {
			fileList = [];
		}

		this.state = Object.assign({
			notifier: null
		}, getFileObj(props));

		this.denyUpdate = false;

		this._fileHandler = this._fileHandler.bind(this);
		this._removeFile = this._removeFile.bind(this);
		this._removeAllFile = this._removeAllFile.bind(this);
	}

	shouldComponentUpdate () {
		if (this.denyUpdate) {
			this.denyUpdate = false;
			return false;
		} else return true;
	}

	componentWillReceiveProps (nextProps) {
		if (nextProps.fileList != this.props.fileList) {
			this.setState(getFileObj(nextProps));
		} else {
			this.denyUpdate = true;
		}
	}

	_fileHandler (indicator, e) {
		var stateObj = this.state;
		var props = this.props;
		var targetObj = e.target;
		var files = targetObj.files;
		var filesLen = files.length;
		var accept = props.accept;

		var fileList = [];
		var internalFileList = [];

		for (var i = 0; i < filesLen; i++) {
			var file = files[i];
			var fileName = file.name;

			if (accept && !accept.find(function(item) {
				var regex = new RegExp(item + "$", "i");
				return fileName.search(regex) > -1;
			})) {
				this.setState({
					notifier: "Accepted type(s): " + accept.toString()
				})
				return;
			} else {
				var fileSize = file.size;
				var data = null;
				if (fileSize && fileSize < 5242880) {
					data = window.URL.createObjectURL(file);
				}
				internalFileList.push({data: data, name: file.name, type: file.type, size: file.size});
				fileList.push(file);
			}
		}

		var setState = function () {
			this.setState({
				internalFileList: internalFileList,
				fileList: fileList,
				notifier: null
			}, function () {
				if (props.onChange) {
					if (props.multiple) props.onChange(fileList);
					else props.onChange(fileList[0]);
				}
			})
		}.bind(this);

		if (indicator == "change") {
			this.setState({internalFileList: [], fileList: []}, setState);
		} else if (indicator == "add") {
			fileList = stateObj.fileList.concat(fileList);
			internalFileList = stateObj.internalFileList.concat(internalFileList);
			setState();
		}

		targetObj.type = "hidden";
		targetObj.type = 'file';
	}

	_removeAllFile (e) {
		var targetObj = e.target;
		targetObj.type = "hidden";
		targetObj.type = 'file';

		this.setState({
			fileList: [],
			internalFileList: []
		}, function () {
			var onChange = this.props.onChange;
			if (onChange) {
				onChange([]);
			}
		})

	}

	_removeFile (index, e) {
		var fileList = this.state.fileList;
		fileList.splice(index, 1);

		var internalFileList = this.state.internalFileList;
		internalFileList.splice(index, 1);

		var setState = function () {
			this.setState({
				internalFileList: internalFileList,
				fileList: fileList
			}, function () {
				var props = this.props;
				var onChange = props.onChange;
				if (onChange) {
					if (props.multiple) onChange(fileList);
					else onChange([]);
				}
			})
		}.bind(this);

		this.setState({internalFileList: [], fileList: []}, setState);
	}

	render () {
		var self = this;
		var stateObj = this.state;
		var props = this.props;
		var fileContainerStyle = {
			maxHeight: '400px',
			overflow: 'auto',
			borderRadius: '6px 6px 0px 0px',
			border: '1px #ccc solid',
			borderBottom: 'none',
			padding: '5px 15px'
		}

		var fileList = stateObj.fileList;
		var internalFileList = stateObj.internalFileList;
		var fileListLen = fileList.length;
		var multiple = props.multiple || null;
		var nameComponent = [];

		var createFilePreviewerList = function (file, index) {
			var fileType = file.type || null;
			nameComponent.push(
				<div key={index} style={{display: 'inline-block', borderRadius: '8px', padding: '4px', border: '1px solid #bbb', fontSize: '12px', verticalAlign: 'middle', lineHeight: '10px', margin: '0px 4px 4px'}}>
					{file.name}
				</div>
			);

			// Only videos and audios over 5 mb will be allowed to be preview, other files will show a notifier - 'too big to preview'

			return (
				<div key={index} style={{display: 'inline-block', margin: '10px', padding: '10px', position: 'relative'}}>
					<div style={{position: 'absolute', right: '-6px', top: '-11px'}}>
						<i onClick={self._removeFile.bind(self, index)} className="fa fa-remove" style={{cursor: 'pointer', verticalAlign: 'middle', fontSize: '1.2em', lineHeight: "22px", color: '#c0582b'}}></i>
					</div>
					{file.data ? 
						<object style={{width: '200px', height: '200px'}} data={file.data} type={fileType}/> :
						<div style={{width: '200px', height: '200px', lineHeight: '190px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px'}}>Can't preview</div>
					}
				</div>
			);
		}

		fileContainerStyle.display = fileListLen ? "block" : "none";

		var nameContainerStyle = {
			zIndex: 4,
			overflow: 'hidden'
		};

		if (fileListLen) Object.assign(nameContainerStyle, {borderRadius: '0px 0px 0px 4px'});

		return (
			<div>
				<div style={fileContainerStyle}>
					{internalFileList.map(createFilePreviewerList)}
				</div>
				<div className="input-group" style={{borderRadius: '0px 0px 4px 0px'}}>
					<div className="form-control" style={nameContainerStyle}>
						<div style={{display: 'inline-block', backgroundColor: 'white', margin: '0px -12px', paddingLeft: '6px'}}>
							{stateObj.notifier || nameComponent}
						</div>
					</div>
					<div className="input-group-btn">
						{fileListLen ?
							<div className="btn btn-default btn-file" style={{display: "inline-block", zIndex: 3, height: '34px', lineHeight: '16px'}} onClick={this._removeAllFile}>
								<i className="fa fa-remove" style={{verticalAlign: 'middle', fontSize: '1.2em', lineHeight: "22px"}}></i>
								<span className="hidden-xs" style={{marginLeft: '3px', verticalAlign: 'middle', lineHeight: "22px"}}> Remove</span>
							</div> : null}

						<div className="btn btn-primary btn-file" style={{height: '34px', lineHeight: '16px', borderRadius: !fileListLen ? '0px 4px 4px 0px' : multiple ? '0px' : '0px 0px 4px 0px', marginRight: '-1px', position: 'relative', zIndex: 2}}>
							<i className={"fa fa-" + (fileListLen ? "edit" : "folder-open")} style={{verticalAlign: 'middle', fontSize: '1.2em', lineHeight: '22px'}}></i>
							<span className="hidden-xs" style={{marginLeft: '3px', verticalAlign: 'middle', display: 'inline-block', lineHeight: "22px"}}> {fileListLen ? "Change" : "Browse"}</span>
							<input ref="change" onChange={this._fileHandler.bind(this, 'change')} type="file" className="file" />
						</div>

						{multiple && fileListLen ?
							<div className="btn btn-success btn-file" style={{height: '34px', lineHeight: '16px', borderRadius: '0px 0px 4px 0px', marginRight: '-1px', position: 'relative', zIndex: 1, minWidth: '36px'}}>
								<IconAdd style={{position: 'absolute', top: '4px', left: '6px'}}/>
								<span className="hidden-xs" style={{marginLeft: '18px', verticalAlign: 'middle', display: 'inline-block', lineHeight: "22px"}}> Add</span>
								<input onChange={this._fileHandler.bind(this, 'add')} type="file" className="file" />
							</div> : null}

					</div>
				</div>
			</div>
		);
	}
}