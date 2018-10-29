import React from 'react';

import $ from 'jquery';

import FileInput from './Components/General/FileInput.js';
import Combo from './Components/General/Combo';
import { IconAdd, IconRemove, IconSave, IconRight, IconLeft } from './Components/General/Icons.js';

import getServerAPI from './Utils/ServerAPI.js';

if (!document.head.querySelector('[data-component-name=ReactFormEngine]')) {
    var newStyleObj = document.createElement('style');
    newStyleObj.dataset.componentName = "ReactFormEngine";
    newStyleObj.innerHTML = 
`
.pointer {
    cursor: pointer;
}

.input-group {
    position: relative;
    display: table;
    border-collapse: separate;
}

.input-group-btn {
    position: relative;
    font-size: 0;
    white-space: nowrap;
}

.btn-file input[type=file] {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 100%;
    min-height: 100%;
    text-align: right;
    opacity: 0;
    background: none;
    cursor: inherit;
    display: block;
}

.custom-pdf-viewer {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0px;
    background-color: rgba(0,0,0,.75);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 1s ease;
    visibility: hidden;
    z-index: 15;
    left: 0px;
    top: 0px;
}
`;
    document.head.appendChild(newStyleObj);
}

const e = React.createElement;

const _getCssObject = function (str) {
    var obj = {};
    str.split(';').map((i) => {
        if (i) {
            var splitI = i.split(':');
            var key = (splitI[0] || '').trim().split('');
            var attr = '';
            var uCase = false;
            key.map((k) => {
                if (k == '-') {
                    uCase = true;
                } else if (uCase) {
                    uCase = false;
                    attr += String.fromCharCode(k.charCodeAt(0) - 32);
                } else attr += k;
            })
            obj[attr] = splitI[1] || '';
        }
    })
    return obj;
}

var tagConverter = {
    'Root': 'div',
    'DropDown': 'select',
    'TextBox': {
        tag: 'input',
        type: 'text'
    },
    'RadioButton': {
        tag: 'div',
        type: 'radio'
    },
    'FileUpload': {
        tag: 'input',
        type: 'file'
    },
    'NumericTextBox': {
        tag: 'input',
        type: 'number'
    },
    'CheckBox': {
        tag: 'div',
        type: 'checkbox'
    },
    'DatePicker': {
        tag: 'input',
        type: 'date'
    },
    'HiddenField': {
        tag: 'input',
        type: 'hidden'
    }
}

var attrConverter = {
    'Id': 'id',
    'Name': 'name',
    'CSSClass': 'className',
    'Label': 'label',
    // 'CSSStyle': 'style',
    '__style': 'style',
    '__onClick': 'onClick'
}

var getForm = function (
    // React, // Not being used at the moment
    // $, // Not being used at the moment
    vars, 
    // Did, // Did => Did of the Modules Row // Not being used at the moment
    // fd, // fd => formData (Form Engine Data) // Not being used at moment
    utilities
) { 
    utilities = utilities || {};

    var Host = '', Premise = '', AppKey = '', Key = '';

    var setVariables = function (data) {
        for (var key in data) {
            var value = data[key];
            switch (key) {
                case "Host":
                    Host = value;
                    if (Host.search(/\/$/) == -1) {
				    	Host += '/';
				    }

				    if (Host.toLowerCase().search(/api\/$/) == -1) {
				    	Host += 'api/';
				    }
                    break;
                case "Premise":
                    Premise = value;
                    if (Premise.search(/\/$/) == -1) {
				    	Premise += '/';
				    } 
                    break;
                case "AppKey":
                    AppKey = value;
                    break;
                case "Key":
                    Key = value;
                    break;
                default:
                    break;
            }
        }
    }

    setVariables(vars);

    var ServerAPI = getServerAPI();
    ServerAPI.setVariables(vars);

    var onChange = utilities.onChange || null;
    var repeater_onChange = utilities.repeater_onChange || {};

    var onLoadStart = utilities.onLoadStart || null;

    var onLoad = utilities.onLoad || null;

    var onSave = utilities.onSave || null;

    var repeater_onSave = utilities.repeater_onSave || null;

    var onGettingPageList = utilities.onGettingPageList || null;

    var onGettingSubPageList = utilities.onGettingSubPageList || null;

    var onGettingFormData = utilities.onGettingFormData || null;

    var onBeforeSave = utilities.onBeforeSave || null;

    var onBeforePageChange = utilities.onBeforePageChange || null;

    var onBeforeRepeaterAddition = utilities.onBeforeRepeaterAddition || null;

    var onRepeaterAddition = utilities.onRepeaterAddition || null;

    var onBeforeRepeaterDeletion = utilities.onBeforeRepeaterDeletion || null;

    var onRepeaterDeletion = utilities.onRepeaterDeletion || null;

    var onBeforeSubPageDeletion = utilities.onBeforeSubPageDeletion || null;

    var onSubPageDeletion = utilities.onSubPageDeletion || null;

    var onError = utilities.onError || null;

    var onBeforeCascade = utilities.onBeforeCascade || null;

    var onCascade = utilities.onCascade || null;

    class ReactFormContainer extends React.Component {
        constructor (props) {
            super(props);
            var self = this;

            var masterData = props.masterData || {};
            var formData = props.data;

            this.state = {
                formActionEnabled: props.masterData ? true : false,
                data: {
                    master: {},
                    repeaters: []
                },
                pages: [],
                subPages: [],
                curPage: 0,
                // subPage: 0,
                Did: props.Did,
                formData: formData && JSON.parse(JSON.stringify(formData)) || null,
                formName: props.formName || null,
                showSubPages: false,
                restoreData: null
            };

            if ('Did' in masterData || 'MID' in masterData) {
                masterData = Object.assign({}, masterData);
                delete masterData.Did;
                delete masterData.MID;
            }

            Object.assign(this.state.data.master, masterData);

            [
                'reset',
                'initialize',
                'getFormData',
                'getPages',
                'getSubPages',
                'getSubFormDid',
                'getKeysAndData',
                'examineBackup',
                'storeLocally',
                '_restoreData',
                '_onChange',
                'getRepeatersData',
                '_onSave',
                'getStoreKey',
                'getOSStoreKey',
                '_alterPage',
                '_loadSubPage',
                '_deleteSubPage',
                '_toggleSubPageView',
                '_onFileChange',
                '_addRepeater',
                '_removeRepeater',
                'cascade',
                'setData',
                'getData',
                'getFormName',
                'setOptions',
                'clickChecker',
                'save'
            ].map(function (fn) {
                self[fn] = self[fn].bind(self);
            })

        }

        reset () {
            // **Need more thorough testing

            this.setState({
                formData: null,
                formActionEnabled: false,
                data: {
                    master: {},
                    repeaters: []
                }
            }, this.initialize);
        
        }

        initialize (_d) {
            _d = _d || {};
            var self = this;
            var props = this.props;
            var stateObj = this.state;
            var fns = [];
            var repeater = props.repeater;

            this._repeaterKeys = {};
            this._repeaterRawElems = {};
            this._selectRawElems = {};
            this._inputRawElems = {};
            // this._repeaterSelectRawElems = {};

            if (props.selectRawElems) {
                this._selectRawElems = props.selectRawElems;
            }

            if (onLoadStart) {
                var _Did = stateObj.Did;
                if (repeater) {
                    if (_Did.search('__TEMP__:') == 0) _Did = '';
                }
            	var onLoadStartData = {
            		Did: _Did || null,
            		repeater: repeater ? true : false,
            		master: props.master ? true : false
            	}

            	if (repeater) {
            		onLoadStartData.PostURL = props.PostURL;
            	} else {
            		onLoadStartData.formName = stateObj.formName;
            	}

            	onLoadStart(onLoadStartData);
            }

            if (!stateObj.formData) {
                fns.push(this.getFormData);
            }

            var master = 'master' in _d ? _d.master : props.master;

            if (master) {
                fns.push(this.getPages);
                stateObj.canRepeat = false;
            } else {
                if (!repeater && stateObj.pages[stateObj.curPage].canRepeat) {
                    stateObj.canRepeat = true;
                } else {
                    stateObj.canRepeat = false;
                }
            }

            if (_d.canRepeat) { // *will be set `true` programmatically for the first time 
                fns.push(this.getSubPages);
            } else if (!_d.repeaterForm && !stateObj.Did && stateObj.curPage > 0) {
                fns.push(this.getSubFormDid);
            }

            var masterData = 'masterData' in _d ? _d.masterData : props.masterData;

            if (!masterData || repeater) {
                fns.push(this.getKeysAndData);
            }

            // if (props.offlineSupport) {
            //     fns.push(this.)
            // }

            if (props.master) {
                fns.push(this.examineBackup);
            }

            var len = fns.length, parsed = -1;

            var makeRequest = function () {
                parsed++;

                if (parsed == len) {
                    resolve();
                    return;
                }

                fns[parsed](function (res) {
                    self.forceUpdate(makeRequest);
                })
                
            }

            var resolve = function () {

                if (onLoad) {
	            	var repeater = props.repeater;
                    var _Did = self.state.Did;
                    if (repeater) {
                        if (_Did.search('__TEMP__:') == 0) _Did = '';
                    }
	            	var onLoadData = {
	            		Did: _Did || null,
	            		repeater: repeater ? true : false,
	            		master: props.master ? true : false
	            	}

	            	if (repeater) {
	            		onLoadData.PostURL = props.PostURL;
	            	} else {
	            		onLoadData.formName = stateObj.formName;
	            		onLoadData.PostURL = self.state.formData.PostURL;
	            	}

	            	onLoadData.data = stateObj.data.master;
	            	onLoad(onLoadData);
                }
            }            

            makeRequest();
        
        }

        componentDidMount () {
            this.initialize();

            if (this.props.master) {
                window.addEventListener('click', this.clickChecker);
            }
        
        }

        componentDidUpdate () {

        }

        componentWillUnmount () {
            if (this.props.master) {
                window.removeEventListener('click', this.clickChecker);
            }
        
        }

        getFormData (callBack) {
            var self = this;
            var props = this.props;

            var formJson = '';
            var formName = this.state.formName;

            $.ajax({
                url: Host.substr(0, Host.length - 4) + 'FE/FormEngine/GetByName?Name=' + formName,

            }).done(function (res) {
                formJson = res;

                var JSON_formData = JSON.parse(res).Json;
                localStorage.setItem('FE_form-data_' + formName, JSON_formData);

                var formData = JSON.parse(JSON_formData);
                // var customPostURL = props.customPostURL;
                // if (customPostURL) formData.PostURL = customPostURL;

                self.setState({
                    formData: formData
                }, callBack);
            }).fail(function (res) {
                if (res.status == 0) {
                    var JSON_formData = localStorage.getItem('FE_form-data_' + formName);
                    if (JSON_formData) {
                        self.setState({
                            formData: JSON.parse(JSON_formData)
                        }, callBack);
                        return;
                    }
                }

                if (onError) {
                    onError({
                        fn: 'getFormData',
                        formName: formName,
                        // type: 'repeater',
                        // action: 'delete',
                        // data: {MID: Did}, // *the condition goes inside the data here
                        // PostURL: mn
                    }, res);
                }

                // console.error(res);
                if (callBack) callBack();
            }).always(function () {
                onGettingFormData ? onGettingFormData(formJson) : null;
            })

        }

        getPages (callBack) {
            // console.log('getPages Called');

            var self = this;
            var stateObj = this.state;
            var fd = stateObj.formData;

            var pages = [{
                Name: this.props.formName || formData.PostURL, // ***Since it probably wont have the formName, we will be temporarily using PostURL
                Did: stateObj.Did
            }];

            fd.Fields.map(i => {
                if (i.Type == 'Page') {
                    pages.push({
                        Name: i.Name,
                        canRepeat: i.isRepete.toLowerCase() == 'true'
                    });
                }
            })

            this.state.pages = pages;

            onGettingPageList ? onGettingPageList(pages) : null;

            if (callBack) {
                this.forceUpdate(function () {
                    callBack(); // *We could have provided the function as an argument, but it would have binded `this` with the callBack
                });
            } else {
                this.forceUpdate();
            }

        }

        getSubPages (callBack) {
            var self = this;
            var stateObj = this.state;

            var queryData = {
                moduleName: stateObj.formData.PostURL,
                where: {
                    MID: stateObj.pages[0].Did
                },
                select: ['Did'],
                optimize: true     
            }

            ServerAPI.aggregate(queryData, function (res) {
                if (res.Status == 'Success') {
                    var resData = res.Data;
                    self.state.subPages = resData.map(i => i.Did);
                    if (!resData.length) {
                        self.state.subPages = [''];
                    } else {
                        self.state.Did = resData[0].Did;
                    }
                } else {
                    if (onError) {
                        onError({
                            fn: 'getSubPages',
                        }, res);
                    }

                    // console.error(res);
                }

                onGettingSubPageList ? onGettingSubPageList(self.state.subPages) : null;

                self.forceUpdate(callBack);
            })
        
        }

        getSubFormDid (callBack) {
            var self = this;
            var stateObj = this.state;

            var queryData = {
                moduleName: stateObj.formData.PostURL,
                where: {
                    MID: stateObj.pages[0].Did
                },
                select: ['Did'],
                optimize: true     
            }

            ServerAPI.aggregate(queryData, function (res) {
                if (res.Status == 'Success') {
                    var resData = res.Data;
                    self.state.Did = resData.length ? resData[0].Did : '';
                } else {
                    if (onError) {
                        onError({
                            fn: 'getSubFormDid',
                        }, res);
                    }
                    // console.error(res);
                }

                self.forceUpdate(callBack);
            })
        
        }

        getKeysAndData (callBack) {
            var self = this;
            var props = this.props;
            var stateObj = this.state;
            var Did = stateObj.Did;
            if (props.repeater) {
                if (Did.search('__TEMP__:') == 0) Did = '';
            }
            var fd = stateObj.formData; // fd => Form Data (Form Engine)
            var hiddenFieldValues = {};
            var _mf = self.state.data.master; // _mf => Form Engine Master Module Fields
            var requests = [];
            // var masterFieldKeys = []; // Retrieving it in the upcoming snippet directly
            var repeaters = [];

            var master = props.master;

            var processElems = function (rawElem, masterFieldKeys, customTag, _au) { // * _au => AjaxUrl - only set when repeater element is recursively parsed
            // var processElems = function (rawElem, masterFieldKeys, customTag) { 
                var inputType = false;
                var tag;

                if (customTag) {
                    tag = customTag;
                } else {
                    tag = rawElem.Type;
                }

                if (tag in tagConverter) {
                    tag = tagConverter[tag];
                    if (typeof tag == 'object') {
                        inputType = tag.type;
                        tag = tag.tag; 
                    }
                } else {
                    tag = tag.toLowerCase();
                }

                if ('CSSStyle' in rawElem) {
                    rawElem.__style = _getCssObject(rawElem.CSSStyle);
                }

                if (tag == 'repeater') {
                    // repeaters.push(rawElem);
                    // ** It expects repeater to always have the `AjaxUrl` attribute, need to prepare for exception too

                    // console.log(rawElem);
                    // console.log(repeaterFieldKeys, rawElem.AjaxUrl);

                    var AjaxUrl = rawElem.AjaxUrl;
                    var repeaterFieldKeys = processElems(rawElem, [], 'div', AjaxUrl);
                    // var repeaterFieldKeys = processElems(rawElem, [], 'div');
                    self._repeaterKeys[AjaxUrl] = repeaterFieldKeys;
                    self._repeaterRawElems[AjaxUrl] = rawElem;

                    if (!props.masterData) {
                        if (Did) {
    	                    requests.push({
    	                        queryData: {
    	                            moduleName: AjaxUrl,
    	                            select: ['Did'].concat(repeaterFieldKeys),
    	                            optimize: true,
    	                            where: {
    	                                MID: Did
    	                            }
    	                        },
    	                        callBack: function (res) {
    	                            // console.log('Repeater', rawElem, res);
    	                            if (res.Status == 'Success') {
    	                                var resData = res.Data;
    	                                rawElem.rowDids = resData.map(i => {
    	                                    return i.Did;
    	                                })

    	                                if (!resData.length) {
    	                                    rawElem.rowDids.push('__TEMP__:' + Math.random());
    	                                }

                                        resData.map(function (i) {
                                            for (var _key in i) {
                                                var val = i[_key];
                                                try {
                                                    var _v = JSON.parse(val);
                                                    if (Array.isArray(_v)) {
                                                        i[_key] = _v;
                                                    }
                                                } catch (ex) {
                                                    // Its not a checkbox value
                                                }
                                            }
                                        })

    	                                rawElem._masterDataCollection = resData;
    	                                self.state.data.repeaters.push(AjaxUrl);
    	                            } else {
                                        if (onError) {
                                            onError({
                                                fn: 'getKeysAndData',
                                                type: 'repeater',
                                                PostURL: AjaxUrl
                                            }, res);
                                        }
    	                                // console.error('Error Occurred', res);
    	                            }
    	                        },
    	                        fn: 'aggregate'
    	                    }) 
                        } else {
                        	requests.push({
                        		callBack: function () {
                        			rawElem.rowDids = [''];
                        			rawElem._masterDataCollection = [];
                        			self.state.data.repeaters.push(AjaxUrl);
                        		},
                        		fn: 'emptyFn'
                        	})
                        }
                    }



                    return;
                } else if (tag == 'select') {
                    // console.log(_au);
                    var Id = rawElem.Id;
                    if (!_au) {
                        // console.log(Id);
                        // if (_au) {
                        //     self._repeaterSelectRawElems[_au] ? null : self._repeaterSelectRawElems[_au] = [];
                        //     self._repeaterSelectRawElems[_au][Id] = rawElem;
                        // } else {
                        //     self._selectRawElems[Id] = rawElem;
                        // }

                        self._selectRawElems[Id] = rawElem;


                        if (!rawElem['DefaultList']) {
                            if (!rawElem['DependantField'] && rawElem['ModuleName']) { // *Dependant - wrong spelling!! However this is how it is set currently! Alas!!!                            
                                var TextColumn = rawElem['TextColumn'], ValueColumn = rawElem['ValueColumn'];
                                var ModuleName = rawElem['ModuleName'];
                                var TextColumn
                                requests.push({
                                    queryData: {
                                        moduleName: ModuleName,
                                        select: [TextColumn, ValueColumn],
                                        optimize: true
                                    },
                                    callBack: function (res) {
                                        // console.log(rawElem, res);
                                        if (res.Status == 'Success') {
                                            rawElem.__options = res.Data.map(i => {
                                                return {
                                                    value: i[ValueColumn],
                                                    label: i[TextColumn]
                                                };
                                            })
                                        } else {
                                            if (onError) {
                                                onError({
                                                    fn: 'getKeysAndData',
                                                    type: 'dropdown',
                                                    PostURL: ModuleName
                                                }, res);
                                            }

                                            // console.error('Error Occurred', res);
                                        }
                                    },
                                    fn: 'aggregate'
                                })
                            }

                            if (rawElem['CascadeField']) {
                                requests.push({
                                    callBack: self.cascade.bind(self, rawElem.Id, true),
                                    fn: 'emptyFn'
                                })
                            }
                            
                        }
                        
                    }


                    masterFieldKeys.push(Id);
                    if (!_au) {
                        self._inputRawElems[Id] = rawElem;
                    }
                } else if (tag == 'input' || tag == 'textarea' || inputType) {
                    var _id = rawElem.Id;
                    if (_id.toLowerCase() != 'did' && (master || _id.toLowerCase() != 'mid')) {
                        masterFieldKeys.push(_id);

                        if (!_au) {
                            if (inputType == 'radio' || inputType == 'checkbox') {
                                self._selectRawElems[_id] = rawElem;
                            }
                            self._inputRawElems[_id] = rawElem;

                            if (inputType == 'hidden') {
                                hiddenFieldValues[_id] = rawElem.Value;
                            }
                        }

                    }

                    // if (!_au) {
                    //     if (inputType == 'radio' || inputType == 'checkbox') {
                    //         self._selectRawElems[_id] = rawElem;
                    //     }
                    //     self._inputRawElems[_id] = rawElem;
                    // }
                }

                var fields = rawElem.Fields;
                if (fields) {
                    fields.map((i, index) => {
                        processElems(i, masterFieldKeys, null, _au);
                    })
                }

                return masterFieldKeys;
            }

            var masterFieldKeys = processElems(fd, [], props.masterTag || null);

            // console.log(repeaters);

            var len = requests.length, parsed = -1;

            var makeRequest = function () {
                parsed++;

                if (parsed == len) {
                    resolve();
                    return;
                }

                var requestObj = requests[parsed];
                ServerAPI[requestObj.fn](requestObj.queryData, function (res) {
                    if (requestObj.callBack) {
                        requestObj.callBack(res);
                    }
                    self.forceUpdate(makeRequest);
                });
            }

            var resolve = function () {
                // if (props.masterData) {
                //     if (!props.disableControl) {
                //         self.setState({
                //             formActionEnabled: true
                //         });
                //     }
                // } else if (Did) {

                if (!props.masterData) {
                    if (!props.emptyInfo && Did) {
                        var queryData = {
                            moduleName: props.PostURL || fd.PostURL,
                            where: {
                                Did: Did
                            },
                            select: ['Did'].concat(masterFieldKeys),
                            optimize: true
                        }

                        ServerAPI.aggregate(queryData, function (res) {
                            if (res.Status == 'Success') {
                                var row = res.Data[0];
                                masterFieldKeys.map(key => {
                                    // ***What if someone provides a wrong key or if the particular row gets deleted
                                    var val = row[key];
                                    try {
                                        var _v = JSON.parse(val);
                                        if (Array.isArray(_v)) {
                                            val = _v;
                                        }
                                    } catch (ex) {
                                        // Its not a checkbox value
                                    }
                                    _mf[key] = val;
                                })

                                if (props.offlineSupport) {
                                    self.storeLocally();
                                }
                            } else {


                                if (onError) {
                                    onError({
                                        fn: 'getKeysAndData',
                                        type: 'master',
                                        PostURL: queryData.moduleName
                                    }, res);
                                }
                                console.error('Error Occurred!', res);
                            }

                            self.setState({
                                formActionEnabled: true
                            }, callBack);
                            // console.log('Form Engine - Module Row Data Loaded!!', res);
                        })

                    } else {
                        masterFieldKeys.map(key => {
                            _mf[key] = hiddenFieldValues[key] || '';
                        })
                        // console.log(_mf);
                        self.setState({
                            formActionEnabled: true
                        }, callBack);
                    }
                    
                } else {
                    // self.forceUpdate(); 
                }
            }

            makeRequest();
        
        }

        examineBackup (callBack) {
            var props = this.props;
            if (!Object.keys(this.state.data.master).length) {
                if (props.offlineSupport) {
                    var restoreData = localStorage.getItem(this.getOSStoreKey());
                    if (restoreData) {
                        this.state.restoreData = JSON.parse(restoreData);
                        this._restoreData(null, null, callBack);
                    }

                    return;
                }
            }

            if (props.restore === false) {
                if (callBack) callBack();
                return;
            }

            var data = localStorage.getItem(this.getStoreKey());
            if (data) {
                this.setState({
                    restoreData: JSON.parse(data)
                }, callBack);
            } else {
                if (callBack) callBack();
            }

        }

        cascade (id, keepVal) {
            var rawElem_cascader = this._selectRawElems[id];
            if (!rawElem_cascader['CascadeField']) return;

            var self = this;
            var stateObj = this.state;

            var _cf = rawElem_cascader.CascadeField; // _cf => cascadeField

            var PostURL = this.props.PostURL || stateObj.formData.PostURL;
            var Did = stateObj.Did || ''; // Form / Repeater Did
            if (Did.search('__TEMP__:') == 0) Did = '';

            if ((onBeforeCascade ? onBeforeCascade({
                Did: Did, // Form / Repeater Did
                PostURL: PostURL,
                id: id,
                value: stateObj.data.master[id]
            }) : null) === false) {
                return;
            }

            if (_cf) {
                // console.log('cascader', rawElem_cascader);
                var rawElem_cascadee = this._selectRawElems[_cf];
                if (rawElem_cascadee) {
                    var dependentFieldId = rawElem_cascadee['DependantField'];
                    if (dependentFieldId) {
                        if (!keepVal) {
                            this.state.data.master[_cf] = ''; // *Since new options are gonna populate, it should probably start with an empty value, except during mounting period
                        }

                        // console.log('cascadee', rawElem_cascadee);
                        var ValueColumn = rawElem_cascadee['ValueColumn'];
                        var TextColumn = rawElem_cascadee['TextColumn'];
                        var cascade_queryData = {
                            moduleName: rawElem_cascadee['ModuleName'],
                            where: {
                                [rawElem_cascadee['DependantColumn']]: this.state.data.master[dependentFieldId], // *DependantColumn - wrong spelling! Alas!!!
                            },
                            select: [ValueColumn, TextColumn],
                            optimize: true
                        }

                        ServerAPI.aggregate(cascade_queryData, function (res) {
                            if (res.Status == 'Success') {
                                var getOptions = () => res.Data.map(i => {
                                    return {
                                        value: i[ValueColumn],
                                        label: i[TextColumn]
                                    };
                                });

                                rawElem_cascadee.__options = getOptions();

                                onCascade ? onCascade({
                                    Did: Did,
                                    PostURL: PostURL,
                                    id: id,
                                    value: stateObj.data.master[id],
                                    data: getOptions()
                                }) : null;
                                self.forceUpdate();
                            } else {
                                if (onError) {
                                    onError({
                                        fn: 'cascade',
                                        id: id,
                                        PostURL: PostURL
                                    }, res);
                                }

                                // console.error('Error Occurred', res);
                            }
                        })
                    }
                }
            }
        
        }

        storeLocally (callBack) {
            var props = this.props;
            var stateObj = this.state;
            var startTime = Date.now();

            var masterData = this.state.data.master;
            var md = {};

            for (var key in masterData) {
                var val = masterData[key];
                if (val instanceof File) {
                    val = '__default:FILE__'; // **We wont be storing File for now!, Need to think about that value too!
                }
                md[key] = val;
            }

            var _d = {
                master: md,
                repeater: this.getRepeatersData()
            }

            var item = JSON.stringify(_d);

            // if (props.master && props.offlineSupport) {
            if (props.offlineSupport) { // probably props.master is always `true`
                localStorage.setItem(this.getOSStoreKey(), item);
            } else {
                localStorage.setItem(this.getStoreKey(), item);
            }

            if (callBack) callBack();

            // Format => FormName-OwnDid-MasterDid

            // console.log(_d);
            // console.log('Time took to process - ' + ((Date.now() - startTime) / 1000) + 's');
        
        }

        _restoreData (e, e2, callBack) {
            var stateObj = this.state;
            var data = stateObj.restoreData;

            var populateData = function (s, d) { // s => source
                for (var key in s) {
                    if (!(key in d)) return;
                    var val = s[key];
                    if (val == '__default:FILE__') {
                        continue;
                    }
                    d[key] = val;
                }
                return d;
            }

            populateData(data.master, stateObj.data.master);

            var repeaterCollection = data.repeater;
            for (var key in repeaterCollection) {
                var rawElem = this._repeaterRawElems[key];
                var MDC = repeaterCollection[key]; // *MDC => _masterDataCollection
                var rowDids = [];
                MDC.map((i, index) => {
                    rowDids.push(i.Did);
                    for (var _k in i) {
                        if (i[_k] == '__default:FILE__') i[_k] = '';
                    }
                })
                rawElem._masterDataCollection = MDC;
                rawElem.rowDids = rowDids;
            }

            this.setState({
                restoreData: null
            }, function () {
                localStorage.removeItem(this.getStoreKey());

                if (callBack) callBack();
            })
        
        }

        _onChange (e) {
            var self = this;
            var stateObj = this.state;
        	if (!stateObj.formActionEnabled) {
        		return;
        	}
            var selectElem = false;
            var targetObj = e.target;
            var id = targetObj.id;
            var value = targetObj.value;
            var prevVal = stateObj.data.master[id];
            var type = targetObj.type;
            if (type == 'checkbox') {
                id = targetObj.name;
                prevVal = stateObj.data.master[id] || [];
                var newValue = [];
                if (targetObj.checked) {
                    newValue = [value].concat(prevVal);
                } else {
                    prevVal.map((i) => {
                        if (i != value) {
                            newValue.push(i);
                        }
                    })  
                }
                value = newValue;
            } else if (type == 'radio') {
                id = targetObj.name;
            } else if (targetObj.tagName == 'SELECT') {
                selectElem = true;   
            }

            var manualRes = undefined;

            var _onChange = onChange;

            if (this.props.repeater) {
            	_onChange = repeater_onChange;
            	if (typeof _onChange == 'object') {
            		_onChange = repeater_onChange[this.props.PostURL];
            	}

            	if (!_onChange) {
            		_onChange = repeater_onChange.__default__;
            	}
            }

            var argsArr = [e, {
                value: {
                    old: prevVal,
                    new: value
                }
            }];

            if (_onChange) {
                var _type = typeof _onChange;

                if (_type == 'object') {
                    if (id in _onChange) {
                        if (typeof _onChange[id] == 'function') {
                            manualRes = _onChange[id].apply(this, argsArr);
                        }
                    } else if ('__default__' in _onChange && typeof _onChange.__default__ == 'function') {
                    	manualRes = _onChange.__default__.apply(this, argsArr);
                    }
                } else if (_type == 'function') {
                    manualRes = _onChange.apply(this, argsArr);
                }
            }

            var manualResType = typeof manualRes;
            if (manualResType == 'undefined') {
	            var masterFields = this.state.data.master;
	            masterFields[id] = value;

	            this.forceUpdate(selectElem ? this.cascade.bind(this, id) : null);
            } else if (manualResType == 'object') {
            	var masterFields = this.state.data.master;
            	var keyFound = false;
            	for (var key in manualRes) {
            		if (key in masterFields) {
            			keyFound = true;
            			masterFields[key] = manualRes[key];
            		}
            	}

            	if (keyFound) this.forceUpdate();
            } else {
            	// Do nothing, user doesnt want to change anything
            }

            if (this.props.repeater) {
                this.props.storeLocally();
            } else {
                this.storeLocally();
            }

        }

        _onFileChange (file, id) {
            // **Provide an option for user to interact
            this._onChange({_fileInput: true,  target: {id: id, value: file}});

            // var masterFields = this.state.data.master;
            // masterFields[id] = file;

            // this.forceUpdate();
        
        }

        getRepeatersData () {
            var refs = this.refs;
            var res = {};
            var Did = this.state.Did;
            this.state.data.repeaters.map(function (mn) {
                var index = 0;
                var RepeaterComp = refs[mn + "_" + index];

                var _d = res[mn] = [];
                while (RepeaterComp) {
                    (function () {
                        var _stateObj = RepeaterComp.state;
                        var _Did = _stateObj.Did;

                        if (_Did.search('__TEMP__:') == 0) _Did = '';

                        var _masterData = _stateObj.data.master;
                        var md = {};

                        for (var key in _masterData) {
                            var val = _masterData[key];
                            if (val instanceof File) {
                                val = '__default:FILE__'; // **We wont be storing File for now!
                            }
                            md[key] = val;
                        }

                        _d.push(Object.assign({Did: _Did, MID: Did}, md));
                    }());

                    index++;
                    RepeaterComp = refs[mn + "_" + index];
                }
            })
            return res;
        
        }

        getStoreKey () {
            var stateObj = this.state;
            var page = stateObj.pages[0];
            var MasterDid = '';
            if (page) {
                MasterDid = page.Did;
            } else {
                MasterDid = stateObj.Did;
            }
            return stateObj.formName + '-' + (stateObj.Did || '') + '-' + (MasterDid || '');
        
        }

        getOSStoreKey () { // getOfflineSupportStoreKey
            var stateObj = this.state;
            var page = stateObj.pages[0];
            var MasterDid = '';
            if (page) {
                MasterDid = page.Did;
            } else {
                MasterDid = stateObj.Did;
            }
            return stateObj.formName + '-' + 'offline-support' + '-' + (stateObj.Did || '') + '-' + (MasterDid || '');
        
        }

        save (callBack) { // API purpose
            this._onSave(null, null, callBack);
        }

        _onSave (e, e2, callBack) {
            var self = this;
            var props = this.props;

            if (props.readOnly) return;
            
            var stateObj = this.state;
            var refs = this.refs;
            var Did = stateObj.Did;
            var requests = [];
            var repeaterModules = stateObj.data.repeaters;

            var errors = [];
            var storeKey = this.getStoreKey();

            var internalErrors = [];

            var isRequired = function (el) {
                var ir = el.IsRequired;
                return typeof ir == 'boolean' ? ir : ir.toLowerCase() == 'true';
            }

            var masterData = stateObj.data.master;
            var md = {};

            for (var key in masterData) {
                var rawElem = this._inputRawElems[key];
                var val = masterData[key];
                if (Array.isArray(val)) {
                    if (!val.length) {
                        val.push(rawElem.NullValue);
                        masterData[key] = val;
                    }

                    val = JSON.stringify(val);
                } else if (!val) {
                    if (isRequired(rawElem)) {
                        internalErrors.push({
                            rawElem: rawElem,
                            message: rawElem.ErrorMessage
                        });
                    }
                    val = rawElem.NullValue;
                    masterData[key] = val;
                }

                md[key] = val;
            }

            var queryData = {
                moduleName: props.PostURL || stateObj.formData.PostURL,
                data: md
            }

            if (Did) {
                queryData.rowDid = Did;
                queryData.type = 'update';
            } else {
                queryData.type = 'insert';
            }

            if (stateObj.curPage > 0) {
                queryData.data = Object.assign({MID: stateObj.pages[0].Did}, queryData.data);
            }

            if ((onBeforeSave ? onBeforeSave(function () {
                var res = {
                    master: Object.assign({Did: Did}, queryData.data),
                    repeaterModules: repeaterModules,
                    repeater: self.getRepeatersData(),
                    formName: stateObj.formName,
                    PostURL: stateObj.formData.PostURL
                };

                return res;
            }()) : null) === false) {
                return;
            }            

            requests.push({
                queryData: queryData,
                callBack: function (res) {
                    if (res.Status == 'Success') {
                        Did = res.Data;
                        var prevDid = self.state.Did;
                        self.state.Did = Did;
                        // alert("Data saved!\nDid - " + res.Data);

                        if (self.state.curPage == 0) {
                            self.state.pages[0].Did = Did;
                        }

                        // **Need to double-check if the following has conflicting use-cases
                        if (!prevDid && self.state.subPages.length) {
                        	self.state.subPages[self.state.subPages.length - 1] = Did;
                        }
                    } else {
                        var errorInfo = {
                            fn: 'onSave',
                            type: 'master',
                            data: queryData.data,
                            PostURL: queryData.moduleName
                        };
                        if (onError) {
                            onError(errorInfo, res);

                        }
                        errors.push([errorInfo, res]);
                        // console.error('Error Occurred', res);
                    }
                },
                fn: 'modifyModuleData'
            })

            var foundRepeaterDids = {};

            repeaterModules.map(function (mn) {
                var index = 0;
                var RepeaterComp = refs[mn + "_" + index];
                var repeaterRowDids = [];
                foundRepeaterDids[mn] = [];
                while (RepeaterComp) {
                    (function () {
                        var internalIndex = index;
                        var _props = RepeaterComp.props;
                        var _stateObj = RepeaterComp.state;
                        var _Did = _stateObj.Did;

                        if (_Did.search('__TEMP__:') == 0) _Did = '';

                        var _masterData = _stateObj.data.master;
                        var _md = {};

                        if (!_Did) {
                            var dataFound = false;
                            for (var repeaterKey in _masterData) {
                                if (_masterData[repeaterKey].toString()) {
                                    dataFound = true;
                                    break;
                                }
                            }
                            if (!dataFound) return;
                        }

                        for (var key in _masterData) { // *Can we squeeze this in the previous snippet?
                            var rawElem = RepeaterComp._inputRawElems[key];
                            var val = _masterData[key];
                            if (Array.isArray(val)) {
                                if (!val.length) {
                                    val.push(rawElem.NullValue);
                                    _masterData[key] = val;
                                }

                                val = JSON.stringify(val);
                            } else if (!val) {
                                if (isRequired(rawElem)) {
                                    internalErrors.push({
                                        rawElem: rawElem,
                                        message: rawElem.ErrorMessage
                                    });
                                }
                                val = rawElem.NullValue;
                                _masterData[key] = val;
                            }

                            _md[key] = val;
                        }

                        var _queryData = {
                            moduleName: mn,
                            data: _md
                        }

                        requests.push({
                            queryData: function () {
                                if (_Did) {
                                    _queryData.rowDid = _Did;
                                    _queryData.type = 'update';   
                                    foundRepeaterDids[mn].push(_Did);                     
                                } else {
                                    _queryData.type = 'insert';
                                    _queryData.data.MID = Did;
                                }
                                
                                return _queryData;
                            },
                            callBack: function (res) {
                                if (res.Status == 'Success') {
                                	var repeaterDid = res.Data;
                                    _stateObj.formData.rowDids[internalIndex] = repeaterDid;
                                    _stateObj.Did = repeaterDid;
                                    // alert("Repeater Data saved!\nDid - " + res.Data);

                                    if (repeater_onSave) {
						            	var repeater_onSaveData = {
						            		Did: repeaterDid || null,
						            		repeater: true,
						            		master: false
						            	}

						            	repeater_onSaveData.PostURL = _props.PostURL;

						            	repeater_onSaveData.data = _stateObj.data.master;
						            	repeater_onSave(repeater_onSaveData);
					                }

                                } else {
                                    if (onError) {
                                        onError({
                                            fn: 'onSave',
                                            type: 'repeater',
                                            data: _queryData.data,
                                            PostURL: _queryData.moduleName
                                        }, res);
                                    }
                                    // console.error('Error Occurred', res);
                                }
                            },
                            fn: 'modifyModuleData'
                        })
                    }());

                    index++;
                    RepeaterComp = refs[mn + "_" + index];
                }
            })

            if (Did) {
                Object.keys(foundRepeaterDids).map(function (mn) {
                    var _Dids = foundRepeaterDids[mn];
                    if (_Dids.length) {
                        var _where = {
                            MID: Did,
                            Did: {
                                '$nin': _Dids
                            }
                        }

                        requests.splice(1, 0, {
                            queryData: {
                                moduleName: mn,
                                where: _where,
                                type: 'delete'
                            },
                            callBack: function (res) {
                                if (res.Status == 'Success') {
                                    // alert(mn + ' -  Repeater extra row deleted!');
                                } else {
                                    var errorInfo = {
                                        fn: 'onSave',
                                        type: 'repeater',
                                        action: 'delete',
                                        data: _where, // *condition to delete is the data here
                                        PostURL: mn
                                    };

                                    if (onError) {
                                        onError(errorInfo, res);

                                    }

                                    errors.push([errorInfo, res]);
                                    // console.error('Error Occurred', res);
                                }
                            },
                            fn: 'modifyModuleData'
                        });
                    }
                })
            }

            var len = requests.length, parsed = -1;

            var makeRequest = function () {
                parsed++;

                if (parsed == len) {
                    resolve();
                    return;
                }

                var requestObj = requests[parsed];

                var _qd = requestObj.queryData; // * _qd => queryData for makeRequest function
                if (typeof _qd == 'function') _qd = _qd();
                ServerAPI[requestObj.fn](_qd, function (res) {
                    if (requestObj.callBack) {
                        requestObj.callBack(res);
                    }
                    self.forceUpdate(makeRequest);
                });
            }

            var resolve = function () {
                var newState = {
                    formActionEnabled: true
                };

                if (!errors.length) {
                    localStorage.removeItem(storeKey);
                    newState.restoreData = null;
                }

                self.setState(newState, function () {

                    if (onSave) {
		            	var repeater = props.repeater;
		            	var onSaveData = {
		            		Did: self.state.Did || null,
		            		repeater: repeater ? true : false,
		            		master: props.master ? true : false
		            	}

		            	if (repeater) {
		            		onSaveData.PostURL = props.PostURL;
		            	} else {
		            		onSaveData.formName = stateObj.formName;
		            		onSaveData.PostURL = self.state.formData.PostURL;
		            	}

		            	onSaveData.data = stateObj.data.master;
                        onSaveData.errors = errors;
		            	onSave(onSaveData);
	                }

                    if (!errors.length) {
                	   if (callBack) callBack();
                    }
                })
            }

            if (internalErrors.length) {
                if (onError) { // **Should we use another error API?
                    var errResponse = onError({
                        fn: 'onSave',
                        type: 'FE-configured-error',
                        errors: internalErrors
                    }, null);

                    if (errResponse !== false) {
                        return;
                    }
                } else {
                    var message = '';
                    internalErrors.map((err, index) => {
                        message += (index + 1) + '.' + ' ' + err.message + "\n";
                    })
                    alert("Following error(s) occurred!\n" + message);
                    return;
                }
            }

            self.setState({
                formActionEnabled: false
            }, makeRequest);
        }

        _alterPage (e) {
            var stateObj = this.state;

            var alter = parseInt(e.currentTarget.dataset.val);

            onBeforePageChange ? onBeforePageChange({
                Did: stateObj.Did,
                pages: stateObj.pages,
                subPageDids: stateObj.subPages,
                alterPage: alter,
                curPage: stateObj.curPage
            }) : null;

            this._onSave(null, null, () => {

                var updatedPage = stateObj.curPage + alter;
                var pageInfo = stateObj.pages[updatedPage];

                this.setState({
                    data: {
                        master: {},
                        repeaters: []
                    },
                    curPage: updatedPage,
                    subPages: [],
                    Did: pageInfo.Did || '',
                    formData: null,
                    formName: pageInfo.Name,
                    formActionEnabled: false
                }, this.initialize.bind(this, {
                    master: false, 
                    masterData: null,
                    canRepeat: pageInfo.canRepeat
                }))

            })

        }

        _loadSubPage (e) {
            var stateObj = this.state;
            var newDid = e.currentTarget.dataset.did || '';
            var curDid = stateObj.Did;

            if (!newDid && !curDid) {
                alert('You already are on a new form page! Save it first before attempting to create a new one!');
                return;
            }

            this.setState({
            	showSubPages: false
            })


            if (curDid != newDid) {

                this._onSave(null, null, () => {

                    if (!newDid) stateObj.subPages.push('');

                    this.setState({
                        data: {
                            master: {},
                            repeaters: []
                        },
                        Did: newDid,
                        formActionEnabled: false
                    }, this.initialize.bind(this, {
                        master: false, 
                        masterData: null,
                        repeaterForm: true
                    }))

                })

            }

        }

        _deleteSubPage (e) {
            var self = this;
            var stateObj = this.state;
            var Did = stateObj.Did;
            var subPages = stateObj.subPages;
            var requests = [];

            if ((onBeforeSubPageDeletion ? onBeforeSubPageDeletion({
                Did: Did,
                formName: stateObj.formName,
                data: Object.assign({MID: stateObj.pages[0].Did, Did: Did}, stateObj.data.master),
                PostURL: stateObj.formData.PostURL,
                subPageDids: stateObj.subPages
            }) : null) === false) {
                return;
            }

            var removedIndex = 0;

            subPages.find((i, index) => {
                if (i == Did) {
                    var mn = stateObj.formData.PostURL;

                    requests.push({
                        queryData: {
                            moduleName: mn,
                            rowDid: i,
                            type: 'delete' 
                        },
                        callBack: function (res) {
                            if (res.Status == 'Success') {
                                removedIndex = index;
                                subPages.splice(index, 1);
                            } else {
                                if (onError) {
                                    onError({
                                        fn: 'deleteSubPage',
                                        // type: 'repeater',
                                        // action: 'delete',
                                        data: i, // *the rowDid to delete
                                        PostURL: mn
                                    }, res);
                                }
                                // console.error(res);
                            }
                        },
                        fn: 'modifyModuleData'
                    })
                    return true;
                }
                return false;
            })

            stateObj.data.repeaters.map(function (mn) {
                requests.push({
                    queryData: {
                        moduleName: mn,
                        where: {
                            MID: Did
                        },
                        type: 'delete'
                    },
                    callBack: function (res) {
                        if (res.Status == 'Success') {

                        } else {
                            if (onError) {
                                onError({
                                    fn: 'deleteSubPage',
                                    type: 'repeater',
                                    // action: 'delete',
                                    data: {MID: Did}, // *the condition goes inside the data here
                                    PostURL: mn
                                }, res);
                            }
                            // console.error(res);
                        }
                    },
                    fn: 'modifyModuleData'
                })
            })

            var len = requests.length, parsed = -1;

            var makeRequest = function () {
                parsed++;

                if (parsed == len) {
                    resolve();
                    return;
                }

                var requestObj = requests[parsed];
                ServerAPI[requestObj.fn](requestObj.queryData, function (res) {
                    if (requestObj.callBack) {
                        requestObj.callBack(res);
                    }
                    self.forceUpdate(makeRequest);
                });
            }

            var resolve = function () {
                onSubPageDeletion ? onSubPageDeletion({
                    Did: Did,
                    formName: stateObj.formName,
                    PostURL: stateObj.formData.PostURL,
                    subPageDids: stateObj.subPages
                }) : null;

                // self._loadSubPage({currentTarget: {
                //     dataset: {
                //         did: subPages.length ? subPages[removedIndex] || subPages[removedIndex - 1] : ''
                //     }
                // }})

                var newDid = subPages.length ? subPages[removedIndex] || subPages[removedIndex - 1] : '';
                if (!newDid) var newSubPages = [''];
                else newSubPages = stateObj.subPages;

                self.setState({
                    showSubPages: false,
                    data: {
                        master: {},
                        repeaters: []
                    },
                    Did: newDid,
                    subPages: newSubPages,
                    formActionEnabled: false
                }, self.initialize.bind(this, {
                    master: false, 
                    masterData: null,
                    repeaterForm: true
                }))
            }            

            this.setState({
                formActionEnabled: false
            }, makeRequest);

        }

        _toggleSubPageView (e) {
            var showSubPages = !this.state.showSubPages;

            this.setState({
                showSubPages: showSubPages
            })
        
        }

        _addRepeater (PostURL, rawElem, e) {
            var keys = ['MID'].concat(this._repeaterKeys[PostURL]);

            if ((onBeforeRepeaterAddition ? onBeforeRepeaterAddition(function () {
                var rDids = [];
                rawElem.rowDids.map((i) => {
                    rDids.push(i.search('__TEMP__:') == 0 ? '' : i);
                })
                return {
                    repeaterDids: rDids,
                    keys: keys,
                    PostURL: PostURL
                }
            }()) : null) === false) {
                return;
            }

            rawElem.rowDids.push('__TEMP__:' + Math.random().toString());
            this.forceUpdate(function () {
                onRepeaterAddition ? onRepeaterAddition({
                    PostURL: PostURL,
                    keys: keys
                }) : null;
            });
        
        }

        _removeRepeater (ref, rawElem, rowDid, e) {
            var self = this;
            var refs = this.refs;
            var PostURL = rawElem.AjaxUrl;

            var actualDid = rowDid.search('__TEMP__:') == 0 ? '' : rowDid;

            if ((onBeforeRepeaterDeletion ? onBeforeRepeaterDeletion({
                data: Object.assign({MID: self.state.Did, Did: actualDid}, refs[ref].state.data.master),
                PostURL: PostURL
            }) : null) === false) {
                return;
            }

            rawElem.rowDids.find((i, _index) => {
                if (i == rowDid) {
                    rawElem.rowDids.splice(_index, 1);
                    return true;
                }
                return false;
            });

            this.forceUpdate(function () {
                onRepeaterDeletion ? onRepeaterDeletion({
                    PostURL: PostURL,
                    Did: actualDid
                }) : null;
            });
        
        }

        setData (d) { // d => dataObject from user end
            var self = this;
            var refs = this.refs;
            var stateObj = this.state;
            var MD = stateObj.data.master; // MD => masterData
            var givenMD = d.master; // givenMD => givenMasterData
            var updateRequired = false;
            if (givenMD) {
                for (var key in givenMD) {
                    if (key in MD) {
                        updateRequired = true;
                        MD[key] = givenMD[key];
                    }
                }
            }

            var repeaterData = d.repeater;
            if (repeaterData) {
                repeaterData.map(function (r) { // r => single repeaterObj
                    var comp;
                    var _ur = false; // _ur => updateRequired for repeater
                    var PostURL = r.PostURL;
                    if ('Did' in r) {
                        var Did = r.Did;

                        var index = 0;
                        var _tempComp = refs[PostURL + '_' + index];
                        while (_tempComp) {
                            if (_tempComp.state.Did == Did) {
                                comp = _tempComp;
                                break;
                            }
                            index++;
                            _tempComp = refs[PostURL + '_' + index];
                        }

                    } else if ('index' in r) {
                        comp = refs[PostURL + '_' + r.index];
                    }

                    if (comp) {
                        var RD = comp.state.data.master; // RD => repeaterData
                        var givenD = r.data; // givenD => givenData for repeater
                        for (var key in givenD) {
                            if (key in RD) {
                                _ur = true;
                                RD[key] = givenD[key];
                            }
                        }

                        if (_ur) {
                            comp.forceUpdate();
                        }
                    }
                })
            }

            if (updateRequired) {
                this.forceUpdate();
            }
        
        }

        getData (d) { // d => dataObject from user end
            var stateObj = this.state;
            var Did = stateObj.Did;
            if (!d) {
                return Object.assign({Did: Did}, stateObj.data.master);
            }

            var repeaterModules = stateObj.data.repeaters;

            if (d === 'ALL') {
                var res = {};

                var res = {
                    master: Object.assign({Did: Did}, stateObj.data.master),
                    // repeaterModules: repeaterModules,
                    repeater: {},
                    // formName: stateObj.formName,
                    // PostURL: stateObj.formData.PostURL
                };

                repeaterModules.map(function (mn) {
                    var index = 0;
                    var RepeaterComp = refs[mn + "_" + index];

                    res.repeater[mn] = [];
                    while (RepeaterComp) {
                        (function () {
                            var _props = RepeaterComp.props;
                            var _stateObj = RepeaterComp.state;
                            var _Did = _stateObj.Did;

                            if (_Did.search('__TEMP__:') == 0) _Did = '';

                            res.repeater[mn].push(Object.assign({Did: _Did, MID: Did}, _stateObj.data.master));
                        }());

                        index++;
                        RepeaterComp = refs[mn + "_" + index];
                    }
                })
            } else if ('PostURL' in d) {
                var comp;
                var PostURL = d.PostURL;
                var refs = this.refs;
                if ('Did' in d) {
                    var Did = d.Did;

                    var index = 0;
                    var _tempComp = refs[PostURL + '_' + index];
                    while (_tempComp) {
                        if (_tempComp.state.Did == Did) {
                            comp = _tempComp;
                            break;
                        }
                        index++;
                        _tempComp = refs[PostURL + '_' + index];
                    }

                } else if ('index' in d) {
                    comp = refs[PostURL + '_' + d.index];
                }

                if (comp) {
                    var _stateObj = comp.state;
                    var _Did = _stateObj.Did;

                    if (_Did.search('__TEMP__:') == 0) _Did = '';

                    return Object.assign({Did: _Did, MID: Did}, _stateObj.data.master);
                } else {
                    return null;
                }
            }

        }

        getFormName () {
            return this.state.formName;
        }

        setOptions (d, data) { // d => dataObject/string from user end, data => array containing label-value pairs
            if (typeof d == 'string') {
                this._selectRawElems[d].__options = data;
                this.forceUpdate();
            } else if ('PostURL' in d) {
                var comp;
                var PostURL = d.PostURL;
                var refs = this.refs;
                if ('Did' in d) {
                    var Did = d.Did;

                    var index = 0;
                    var _tempComp = refs[PostURL + '_' + index];
                    while (_tempComp) {
                        if (_tempComp.state.Did == Did) {
                            comp = _tempComp;
                            break;
                        }
                        index++;
                        _tempComp = refs[PostURL + '_' + index];
                    }

                } else if ('index' in d) {
                    comp = refs[PostURL + '_' + d.index];
                } else {
                    var index = 0;
                    var _comp = refs[PostURL + '_' + index];
                    while (_comp) {
                        _comp._selectRawElems[d.id].__options = data;
                        _comp.forceUpdate();

                        index++;
                        _comp = refs[PostURL + '_' + index];
                    }
                }

                if (comp) {
                    comp._selectRawElems[d.id].__options = data; 
                    this.forceUpdate();
                }
            }
        
        }

        clickChecker (e) {
            var spc = this.refs['sub-page-container']; // spc => subPageContainer;
            if (spc) {
                if (this.state.showSubPages) {
                    if (!spc.contains(e.target)) {
                        this.setState({showSubPages: false});
                    }
                }
            }
        
        }

        getRawElement (query) {
            var formData = this.state.formData;

            var _re = null; // *raw element to get

            var searchElem = function (rawElem) {
                if (_re) return;
                var exactMatch = true;
                var tag = rawElem.Type;
                if (typeof tag == 'string') {
                    tag = tag.toLowerCase();
                } else {
                    tag = '';
                }

                if (tag == 'repeater') {
                    return null;
                }

                for (var _key in query) {
                    if (rawElem[_key] != query[_key]) {
                        exactMatch = false;
                        break;
                    }
                }

                if (exactMatch) {
                    _re = rawElem;
                } else {
                    var fields = rawElem.Fields;
                    if (fields) {
                        fields.map((i) => {
                            searchElem(i);
                        })
                    }
                }
            }

            searchElem(formData);

            return _re;
        }

        render () {
            var self = this;
            var stateObj = this.state;
            var masterProps = this.props;
            var fd = stateObj.formData; // fd => Form Data (Form Engine)
            var _mf = stateObj.data.master; // _mf => Form Engine Master Module Fields

            if (!fd) {
                return (
                    <div 
                        style={{textAlign: 'center'}}
                        >
                        Please Wait...
                    </div>
                );
            }

            var formActionEnabled = stateObj.formActionEnabled;
            // var _repeaterSelectRawElems = this._repeaterSelectRawElems;

            var readOnly = masterProps.readOnly === true ? true : false;

            var disableIcon = masterProps.disableIcon === true ? true : false;

            var getComponent = masterProps.getComponent || {};
            var getCheckboxComponent = getComponent.checkbox;
            var getDateComponent = getComponent.date;

            var buttonClassName = masterProps.buttonClassName;
            if (typeof buttonClassName != 'string') buttonClassName = 'btn-xs'; 
            buttonClassName += ' ';

            var generateChildren = function (rawElem, key, customTag) {
                var inputType = false;
                var tag;

                if (customTag) {
                    tag = customTag;
                } else {
                    tag = rawElem.Type;
                }

                if (tag in tagConverter) {
                    tag = tagConverter[tag];
                    if (typeof tag == 'object') {
                        inputType = tag.type;
                        tag = tag.tag; 
                    }
                } else {
                    tag = tag.toLowerCase();
                }

                if (tag == 'page') {
                    return null;
                }

                if (tag == 'repeater') {
                    
                    if (rawElem.rowDids) {
                        var AjaxUrl = rawElem.AjaxUrl;

                        return (
                            <div
                                key={AjaxUrl}
                                >
                                {rawElem.rowDids.map((rowDid, index) => {
                                    return (
                                        <div
                                            key={AjaxUrl + '_' + (rowDid || index)}
                                            style={{
                                                clear: 'both',
			                                	border: '0px solid #ccc',
			                                	borderBottomWidth: '1px',
			                                	marginBottom: '10px'
                                            }}

                                            >
                                            <ReactFormContainer
                                            	repeater
                                                data={rawElem}
                                                masterData={rawElem._masterDataCollection[index]} // || {}
                                                ref={AjaxUrl + "_" + index}
                                                // key={AjaxUrl + "_" + index}
                                                masterTag={'div'}
                                                PostURL={AjaxUrl}
                                                disableControl
                                                Did={rowDid}
                                                storeLocally={self.storeLocally}
                                                // selectRawElems={_repeaterSelectRawElems[AjaxUrl]}
                                                />
                                            <div
                                            	style={{
                                            		display: 'inline-block',
                                            		width: '100%',

                                            	}}
                                            	>
	                                            <button 
	                                                style={{
	                                                    margin: '5px'
	                                                }}
                                                    disabled={!formActionEnabled}
	                                                className={'btn ' + buttonClassName + 'btn-danger pull-right'}
                                                    onClick={self._removeRepeater.bind(self, AjaxUrl + "_" + index, rawElem, rowDid)}
                                                    // **Need to do something to avoid this binding
	                                                >
                                                    {disableIcon ? null : <IconRemove style={{fill: 'white', marginTop: '-2px', marginRight: '5px', height: '10px', width: '10px'}} />}
	                                                Remove
	                                            </button>
	                                        </div>
                                        </div>
                                    );
                                })}

                                <div
                                    style={{
                                        clear: 'both',
                                        textAlign: 'right'
                                    }}
                                    >
                                    <button 
                                        className={'btn ' + buttonClassName + 'btn-primary'}
                                        disabled={!formActionEnabled}
                                        onClick={self._addRepeater.bind(self, AjaxUrl, rawElem)}
                                        // **Need to do something to avoid this binding
                                        >
                                        {disableIcon ? null : <IconAdd style={{fill: '#fff', marginTop: '-2.5px', marginRight: '3px', height: '18px', width: '18px'}} />}
                                        Add
                                    </button>
                                </div>
                            </div>
                        );
                    }
                    return null;
                }
               
                var children = [];

                var props = {

                };

                if (typeof key != 'undefined') props.key = key;
                if (inputType) props.type = inputType;

                for (var _key in rawElem) {
                    if (_key in attrConverter) {
                        // if (_key == '__style') {
                        //     if (rawElem[_key]) {
                        //         props.style = rawElem.__style;
                        //     }
                        //     continue;
                        // }

                        var val = rawElem[_key];
                        if (val == '') continue;
                        var jsKey = attrConverter[_key];
                        // if (jsKey == 'style') {
                        //     val = _getCssObject(val);
                        // }

                        props[jsKey] = val;
                    }
                }

                // **Temp Purpose

                // var tempObj = {};
                // for (var _key in rawElem) {
                //     if (_key != 'Fields') {
                //         tempObj[_key] = rawElem[_key];
                //     }
                // }
                // props['data-fe'] = JSON.stringify(tempObj);


                var rChildren = rawElem.__children;
                if (rChildren) {
                    if (Array.isArray(rChildren)) {
                        rChildren.map(rChild => {
                            children.push(rChild);
                        })
                    } else {
                        children.push(rChildren);
                    }
                }

                var fields = rawElem.Fields;
                if (fields) {
                    fields.map((i, index) => {
                        children.push(generateChildren(i, index));
                    })
                } else {
                    if (tag == 'label') {
                        children = rawElem.Label || '';
                        delete props.label;
                    } else if (tag == 'select') {

                        // ** Previous mechanism
                        // children.push(<option value="" key="__default">--SELECT AN ITEM--</option>);
                        // if (rawElem['__options']) {
                        //     rawElem.__options.map(i => {
                        //         var val = i.value;
                        //         children.push(<option value={val} key={val}>{i.label}</option>);
                        //     })
                        // } else if (rawElem['DefaultList']) {
                        //     var options = rawElem.DefaultList.split(',');
                        //     options.map((i, index) => {
                        //         children.push(<option value={i} key={index}>{i}</option>);
                        //     })
                        // }
                        // props.value = _mf[rawElem['Id']] || ''; 
                        // props.onChange = self._onChange;
                        // ** End of Previous mechanism



                        // var options = [{
                        //     label: '--SELECT AN ITEM--',
                        //     value: ''
                        // }];

                        var options = [];

                        if (rawElem['__options']) {
                            rawElem.__options.map(i => {
                                options.push({
                                    label: i.label,
                                    value: i.value
                                })
                            })
                        } else if (rawElem['DefaultList']) {
                            var _o = rawElem.DefaultList.split(',');
                            _o.map((i, index) => {
                                options.push({
                                    label: i,
                                    value: i
                                })
                            })
                        }

                        delete props.key;

                        return (
                            <Combo
                                key={key || null}
                                rawElem={rawElem}
                                value={_mf[rawElem['Id']] || ''}
                                options={options}
                                onChange={self._onChange}
                                internalProps={props}
                                />
                        );
                    } else if (tag == 'input' || tag == 'textarea') {
                        // if (inputType == 'date') {
                        //     props.pattern = "[0-9]{2}-[0-9]{2}-[0-9]{4}";
                        // }

                        if (readOnly) props.readOnly = true;

                        if ('label' in props) {
                            props.placeholder = props.label;
                            delete props.label;
                        }

                        if (inputType == 'date') {
                            if (getDateComponent) {
                                // children = [getCheckboxChildren(
                                //     rawElem, // The rawElem to start with
                                //     props, // the props about to be set for this component
                                //     val, // value of the element
                                //     valObj, // valueObj - Effecient for `checked` value handling
                                    // self._onChange, // the `onChange` function that gets attached to input elements while being rendered from the react-form-engine
                                // )];

                                var userSentComp = getDateComponent(
                                    rawElem, // The rawElem to start with
                                    props, // the props about to be set for this component
                                    _mf[rawElem['Id']], // value of the element
                                    null, // valueObj - Effecient for `checked` value handling
                                    self._onChange, // the `onChange` function that gets attached to input elements while being rendered from the react-form-engine
                                );

                                if (userSentComp !== false) return userSentComp;
                            }
                        }

                        if (inputType == 'hidden') {
                            props.value = rawElem.Value || _mf[rawElem['Id']] || '';
                        } else if (inputType != 'file') {
                            props.value = _mf[rawElem['Id']] || ''; // ** Set it before mounting for the first time
                            props.onChange = self._onChange;
                        } else {
                            return (
                                <FileInput 
                                	key={key || null} 
                                	name={props.id}  
                                	// accept={["pdf", 'docx']}
                                	onChange={self._onFileChange} 
                                	fileList={_mf[rawElem['Id']] || ''} // **More like an initialFileList, as setting this value affects only for the first time 
                                	/>
                            );
                        }
                    } else if (inputType == 'radio' || inputType == 'checkbox') {
                        delete props.type;
                        
                        if (readOnly) props.readOnly = true;

                        var valObj = {};
                        var val = _mf[rawElem['Id']];
                        if (Array.isArray(val)) {
                            val.map(_v => {
                                valObj[_v] = true;
                            })
                        } else {
                            valObj[val] = true;
                        }

                        if (getCheckboxComponent) {
                            // children = [getCheckboxChildren(
                            //     rawElem, // The rawElem to start with
                            //     props, // the props about to be set for this component
                            //     val, // value of the element
                            //     valObj, // valueObj - Effecient for `checked` value handling
                                // self._onChange, // the `onChange` function that gets attached to input elements while being rendered from the react-form-engine
                            // )];

                            var userSentComp = getCheckboxComponent(
                                rawElem, // The rawElem to start with
                                props, // the props about to be set for this component
                                val, // value of the element
                                valObj, // valueObj - Effecient for `checked` value handling
                                self._onChange, // the `onChange` function that gets attached to input elements while being rendered from the react-form-engine
                            );

                            if (userSentComp !== false) return userSentComp;
                        }


                        if (rawElem['__options']) {
                            rawElem.__options.map(i => {
                                var val = i.value;
                                // children.push(<input onChange={self._onChange} name={props.id} type={inputType} key={val} checked={val == _mf[rawElem['Id']]} value={val} />);
                                children.push(<input onChange={self._onChange} name={props.id} type={inputType} key={val} checked={valObj[val] || false} value={val} />);
                                children.push(<span key={val + '_' + '_label'} style={{margin: '0px 5px'}}>{i.label}</span>);
                            })
                            // props.onChange = self._onChange;
                        } else if (rawElem['DefaultList']) {
                            var options = rawElem.DefaultList.split(',');
                            options.map((i, index) => {
                                // children.push(<input onChange={self._onChange} name={props.id} type={inputType} key={i} checked={i == _mf[rawElem['Id']]} value={i} />);
                                children.push(<input onChange={self._onChange} name={props.id} type={inputType} key={i} checked={valObj[i] || false} value={i} />);
                                children.push(<span key={i + '_' + '_label'} style={{margin: '0px 5px'}}>{i}</span>);
                            })
                            // props.onChange = self._onChange;
                        } else {
                            return null;
                        }
                    } else {
                        children = null;
                    }
                } 

                var childrenLen = children.length;
                if (childrenLen == 1) children = children[0];

                return e(
                    tag,
                    props,
                    children && childrenLen ? children : null
                );
            }

            var children = generateChildren(fd, null, masterProps.masterTag || null);

            var pages = stateObj.pages;
            var subPages = stateObj.subPages;

            var Did = stateObj.Did;

            var showSubPageOption = stateObj.canRepeat;

            return (
                <div>
                    <div
                        // Notifier Div
                        >

                    </div>

                    {stateObj.restoreData ?
                        <div 
                            onClick={this._restoreData}
                            style={{
                                textAlign: 'center'
                            }}
                            >
                            <div 
                                style={{
                                    display: 'inline-block',
                                    borderRadius: '8px',
                                    backgroundColor: '#f8fbc7',
                                    color: '#848788',
                                    fontWeight: 'bold',
                                    fontSize: '13px',
                                    padding: '2px 12px',
                                    border: '1px solid #e0e0c1',
                                    marginTop: '5px',
                                    cursor: 'pointer'
                                }}
                                >
                                Restore unsaved work!
                            </div>
                        </div>
                            :
                        null
                    }
                    {pages.length ?
                        <div>
                            {showSubPageOption ?
                                <div
                                    className='dropdown'
                                    style={{
                                        float: 'left',
                                        padding: '12px 0px 0px 12px'
                                    }}
                                    ref='sub-page-container'
                                    >
                                    <button disabled={formActionEnabled ? false : true} onClick={this._toggleSubPageView} className="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown">
                                        Select Sub-page
                                        <span style={{margin: '0px 5px'}} className="caret"></span>
                                    </button>
                                    <ul 
                                        className='dropdown-menu'
                                        style={{
                                            display: stateObj.showSubPages ? 'block' : 'none'
                                        }}
                                        >
                                        {subPages.map(function (i, index) {
                                            return (
                                                <li
                                                    key={index}
                                                    data-did={i}
                                                    onClick={self._loadSubPage}
                                                    className={Did == i ? 'active' : null}
                                                    >
                                                    <a href='javascript:void(0);'>Sub-page {index + 1}</a>
                                                </li>
                                            );
                                        })}
                                        <li key='divider' className="divider"></li>
                                        <li key='new-sub-page' onClick={self._loadSubPage} className={Did ? null : 'disabled'}>
                                            <a href='javascript:void(0);'>New</a>
                                        </li>
                                    </ul>
                                </div>
                                    :
                                null
                            }
                            {showSubPageOption && Did ?
                                <div
                                    style={{
                                        float: 'right',
                                        padding: '12px 12px 0px 0px'
                                    }}
                                    >
                                    <button disabled={formActionEnabled ? false : true} onClick={this._deleteSubPage} className={'btn ' + buttonClassName + 'btn-danger'}>Delete Sub-page</button>
                                    {/*
                                        <button 
                                            disabled={formActionEnabled ? false : true} 
                                            onClick={this.reset} // *User interaction based event function, but no `_` before the name since we are planning to use it as an api also
                                            className='btn btn-xs btn-default'
                                            style={{margin: '0px 5px'}}
                                            >
                                            Reload Form
                                        </button>
                                    */}
                                </div>
                                        :
                                null
                            }
                        </div>
                            :
                        null
                    }
                    {children}
                    {masterProps.disableControl ?
                        null
                            :
                        <div
                            style={{
                                float: 'left',
                                clear: 'both',
                                textAlign: 'right',
                                width: '100%',
                                padding: '8px 15px'
                            }}
                            className="rfe-control"
                            >
                            <div>
                                <div>
                                    <button 
                                        disabled={formActionEnabled ? false : true} 
                                        onClick={this._onSave} 
                                        className={'btn ' + buttonClassName + 'btn-success text-right'}
                                        >
                                        {disableIcon ? null : <IconSave style={{marginTop: '-2px', marginRight: '5px'}} />}
                                        Save
                                    </button>
                                </div>
                                {pages.length > 1 ?
                                    <div style={{clear: 'both', padding: '8px'}}>
                                        <button data-val="-1" disabled={!formActionEnabled || !stateObj.curPage} onClick={this._alterPage} className={'btn ' + buttonClassName + 'btn-primary pull-left'}>{disableIcon ? null : <IconLeft style={{marginTop: '-2px', marginRight: '5px'}} />}Previous</button>
                                        <button data-val="1" disabled={!formActionEnabled || pages.length - 1 == stateObj.curPage} onClick={this._alterPage} className={'btn ' + buttonClassName + 'btn-primary pull-right'}>Next{disableIcon ? null : <IconRight style={{marginTop: '-2px', marginLeft: '5px'}} />}</button>
                                    </div>
                                        :
                                    null
                                }
                            </div>
                        </div>
                    }
                </div>
            );
        }
    
    }

    return ReactFormContainer;
}

export default getForm;