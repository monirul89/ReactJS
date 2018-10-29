import React, { Component } from 'react';

import $ from 'jquery';

// import LeaseForm1Data from './Stores/LeaseForm1.form.json';
import _FormData from './Stores/Testing.form.json';

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
    'TextBox': 'input'
}

var attrConverter = {
    'Id': 'id',
    'Name': 'name',
    'CSSClass': 'className',
    'Label': 'label',
    'CSSStyle': 'style'
}

var test = function (React, $, vars, Did, fd, utilities) { // fd => formData (Form Engine Data)

    var Host = '', Premise = '', AppKey = '', Key = '';

    var onChange = utilities.onChange || null;

    var LoginStore = {
        getLoginData: function () {
            return {
                Key: Key
            }
        }
    }

    var handleUnauthorizedAccess = function () {
        console.log(err);
    }

    var errorListenerAction = function (err) {
        console.log(err);
    }

    var ServerAPI = {
        setVariables: function (data) {
            for (var key in data) {
                var value = data[key];
                switch (key) {
                    case "Host":
                        Host = value;
                        break;
                    case "Premise":
                        Premise = value;
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
        },

        processResponse: function (receivedData, responseStatus, xhrObj) {
            if (typeof xhrObj != 'object') {
                responseStatus = xhrObj
                xhrObj = receivedData;
            }

            var temp = xhrObj.getAllResponseHeaders().split('\n');
            var responseHeaders = {};
            temp.map(function (item) {
                if (item.trim()) {
                    var splittedArr = item.split(':');
                    responseHeaders[splittedArr[0]] = splittedArr[1].trim();
                }
            })

            if (xhrObj.status == 200 && responseStatus == 'success') {
                if (receivedData.Status == "Success") {
                    return true;
                } else {
                    var errorData = {
                        statusText: receivedData.Status,
                        statusCode: xhrObj.status
                    }

                    errorListenerAction(errorData);

                    return receivedData.Status === 'abort';

                    //return false;
                }
            } else {
                if (xhrObj.status == 401) {
                    handleUnauthorizedAccess();
                    // Change this portion of code to make a generalized outlet to handle unauthorized access!!

                    return false;
                }
                var errorData = {
                    statusText: responseStatus,
                    statusCode: xhrObj.status
                };

                errorListenerAction(errorData);

                return receivedData.Status === 'abort';

                //return false;
            }
            return true;
        },

        generateCSVArray: function (arr) {
            var CSV = "";
            if (Array.isArray(arr)) {
                for (var i in arr) {
                    CSV += '"' + arr[i] + '",';
                }
                CSV = '[' + CSV.substr(0, CSV.length - 1) + ']';
            } else {
                CSV = '["' + arr + '"]';
            }

            return CSV;
        },

        getModuleData: function (data, callBack) {
            var key = LoginStore.getLoginData().Key;
            var moduleName = data.moduleName;
            var select = data.select || false;
            var rowDid = data.rowDid || false;
            var where = data.where || false;
            var orderBy = data.orderBy || false;
            var limit = data.limit || false;
            var url = "", query = "";

            var formData;

            url = Host + AppKey + "/ModuleData/" + moduleName;

            var selectQuery = "";
            var whereQuery = "";
            var orderQuery = ""; 
            var limitQuery = "";
            if (select) {
                for (var i in select) {
                    selectQuery += select[i] + ",";
                }
                selectQuery = selectQuery.substr(0, selectQuery.length - 1);
                selectQuery = '"Select": "' + selectQuery + '"' + ',';
            }

            if (where) {
                whereQuery = '"Where": \'$and: [{$and: [' + ServerAPI.generateFormDataQuery(where)  + ']}]\'' + ',';
            }

            if (orderBy) {
                var orderKeys = Object.keys(orderBy);
                for (var i in orderKeys) {
                    orderQuery = '"' + orderKeys[i] + ':' + orderBy[orderKeys[i]] + '"';
                }
                orderQuery = '"OrderBy":' + orderQuery + ',';
            }

            if (limit) {
                limitQuery = '"Limit":"' + limit + '",';
            }

            if (!rowDid && (selectQuery || whereQuery || orderQuery || limitQuery)) {
                query = selectQuery + whereQuery + orderQuery + limitQuery;
                query = query.substr(0, query.length - 1);
                query = '"query": [{' + query + '}]';
                if (query.length > 400) {
                    formData = new FormData();
                    formData.append('query', '{' + query + '}');
                    url += "/SqlQueryPOST/";
                    url += "?Key=" + key + "&SqlQuery=1&SqlPOST=1 &QueryPOST=1 &ResultGet=1";
                } else {
                    url += "/SqlQuery/";
                    url += "?Key=" + key + '&query={' + query + '}';
                }
            } else {
                if (rowDid) {
                    url += "/" + rowDid + "/";
                }
                url += "?Key=" + key;
            }

            //console.log(url);
            var ajaxParam = {
                type: "GET",
                url: url,
                contentType: false,
                processData: false
            }

            if (formData) {
                ajaxParam.data = formData;
                ajaxParam.type = "POST";
            }

            return $.ajax(ajaxParam).always(function (receivedData, responseStatus, xhrObj) {
                if (ServerAPI.processResponse(receivedData, responseStatus, xhrObj)) {
                
                } 
                if (callBack) callBack(receivedData);
            })
        },

        generateFormDataQuery: function (where) {
            var whereKeys = Object.keys(where);
            var whereObj = {};
            whereKeys.map(function (item) {
                if (typeof where[item] != "object") {
                    whereObj[item] = where[item].toString();
                } else {
                    var currentItem = whereObj[item] = {};
                    if (Array.isArray(where[item])) {
                        currentItem["$in"] = where[item];

                    } else {
                        Object.keys(where[item]).map(function (modifier) {
                            if (modifier == "$like") {
                                let regex = where[item][modifier];
                                if (!(regex instanceof RegExp)) {
                                    regex = {source: regex};
                                } 
                                if (regex.flags) currentItem['$options'] = regex.flags;
                                currentItem["$regex"] = regex.source;
                            } else {
                                currentItem[modifier] = where[item][modifier];
                            }
                        })
                    }
                    
                }
            })
            return JSON.stringify(whereObj);
        },

        modifyModuleData: function (data, callBack) {
            var key = LoginStore.getLoginData().Key;
            var url = Host + AppKey + "/ModuleData";
            var formData = null;
            var rowDid = data.rowDid;
            rowDid = rowDid ? ("/" + rowDid) : "";

            if (data.type == 'delete') {
                if (!rowDid) {
                    formData = new FormData();
                    formData.append('query', '{$and:[' + ServerAPI.generateFormDataQuery(data.where) + ']}');
                    url += "/" + data.moduleName + "/DeleteDataWithCondition?Module=" + data.moduleName + "&Test=12&Test2=212&key=" + key;
                } else {
                    url += "/DeleteData";
                    url += "/" + data.moduleName + rowDid + "?key=" + key;
                }
            } else {
                var inlineTestKeyValue = "";
                formData = new FormData();
                if (data.where) {
                    formData.append('query', '{$and:[' + ServerAPI.generateFormDataQuery(data.where) + ']}');

                    var value = data.data;
                    var valueKeys = Object.keys(value);
                    var valueQuery = "";
                    for (var i in valueKeys) {
                        valueQuery += '"' + valueKeys[i] + '":"' + value[valueKeys[i]] + '",'; 
                    }
                    valueQuery = valueQuery.substr(0, valueQuery.length - 1);
                    formData.append('value', '{$set:{' + valueQuery + '}}');

                    url += "/" + data.moduleName + "/UpdateDataWithCondition?Module=" + data.moduleName + "&";
                } else {
                    var rowData = data.data;
                    if (Array.isArray(rowData)) {
                        formData = "data=" + JSON.stringify(rowData);
                        url += "/BulkInsert";
                        data.contentType = "application/x-www-form-urlencoded";
                        inlineTestKeyValue = 'test1=123&';
                    } else {
                        var dataKeys = Object.keys(rowData);
                        dataKeys.map(function (item) {
                            formData.append(item, rowData[item]);
                        })
                        if (data.type == "update") {
                            url += "/UpdateData";
                        }
                    }
                    
                    url += "/" + data.moduleName + rowDid + "?";
                }
                url += inlineTestKeyValue + "key=" + key;
            }

            var ajaxParam = {
                type: "POST",
                url: url,
                processData: false
            }

            if (formData) {
                ajaxParam.data = formData;
                ajaxParam.contentType = data.contentType || false;
            }

            return $.ajax(ajaxParam).always(function (receivedData, responseStatus, xhrObj) {
                if (ServerAPI.processResponse(receivedData, responseStatus, xhrObj)) {
                
                } 
                if (callBack) callBack(receivedData);
            })
        },

        /*rawAggregate: function (data, callBack) {
            var Condition = data.Condition;
            Condition.map(function (item, index) {
                Condition[index] = JSON.stringify(item);
            })

            var formData = new FormData();
            formData.append("ModuleKey", data.ModuleKey);
            formData.append("Condition", JSON.stringify(Condition));
            formData.append("Distinct", data.Distinct || "");
            formData.append("Count", data.Count ? 'true' : 'false');

            $.ajax({
                url: Host + AppKey + "/ModuleData/" + "Aggregate" + "?" + "key=" + LoginStore.getLoginData().Key,
                type: "POST",
                data: formData,
                contentType: false,
                processData: false
            }).always(function (receivedData, responseStatus, xhrObj) {
                if (ServerAPI.processResponse(receivedData, responseStatus, xhrObj)) {
                    if (callBack) callBack(receivedData);
                } 
            })
        },*/

        aggregate: function (data, callBack) {
            var Condition = [], dataOptimized = false, fieldList = [];
            if (data.where) {
                Condition.push(JSON.stringify({"$match": data.where}));
            }

            if (data.group) {
                Condition.push(JSON.stringify({"$group": data.group}));
            }

            if (data.orderBy) {
                Condition.push(JSON.stringify({"$sort": data.orderBy}));
            }

            if (data.skip) {
                Condition.push(JSON.stringify({"$skip": data.skip}));
            }

            if (data.limit) {
                Condition.push(JSON.stringify({"$limit": data.limit}));
            }


            if (!data.count) {
                if (data.select) {
                    var select = data.select;
                    if (select && typeof select == "string") {
                        select = select.split(',');
                    }
                    var projectObj = {};
                    if (data.optimize === true) {
                        select.map(function (item, index) {
                            projectObj[index] = "$" + item;
                        })
                        dataOptimized = true;
                    } else {
                        select.map(function (item, index) {
                            projectObj[item] = 1;
                        })
                    }
                    fieldList = select;
                    Condition.push(JSON.stringify({"$project": projectObj}));
                } else if (data.optimize) {
                    fieldList = preStoredModuleFields[data.moduleName];
                    if (fieldList) {
                        var excludeKeys = data.excludeKeys;
                        if (excludeKeys) {
                            var newFieldList = [];
                            fieldList.map(function (item) {
                                if (!excludeKeys.find(function (excludeKey) {
                                    return item === excludeKey;
                                })) {
                                    newFieldList.push(item);
                                }
                            })
                            fieldList = newFieldList;
                        }
                        var projectObj = {};
                        fieldList.map(function (item, index) {
                            projectObj[index] = "$" + item;
                        })
                        dataOptimized = true;
                    }
                    Condition.push(JSON.stringify({"$project": projectObj}));
                }
            }

            var formData = new FormData();
            formData.append("ModuleKey", data.moduleName);
            formData.append("Condition", JSON.stringify(Condition));
            formData.append("Distinct", data.distinct || "");
            formData.append("Count", data.count ? 'true' : 'false');

            return $.ajax({
                url: Host + AppKey + "/ModuleData/" + "Aggregate" + "?" + "key=" + LoginStore.getLoginData().Key,
                type: "POST",
                data: formData,
                contentType: false,
                processData: false
            }).always(function (receivedData, responseStatus, xhrObj) {
                if (ServerAPI.processResponse(receivedData, responseStatus, xhrObj)) {
                    if (dataOptimized) {
                        var parsedData = JSON.parse(receivedData.Data);
                        var processedData = [];
                        parsedData.map(function (item, index) {
                            var newRow = {};
                            var keys = Object.keys(item);
                            keys.map(function (key, subIndex) {
                                newRow[fieldList[parseInt(key)]] = item[key];
                            })
                            processedData.push(newRow);
                        })
                        receivedData.Data = processedData;
                    }
                }

                if (callBack) callBack(receivedData);
            })
        }
    }

    ServerAPI.setVariables(vars);

    var requests = [];

    class ReactFormContainer extends React.Component {
        constructor (props) {
            super(props);
            var self = this;

            this.state = {
                formActionEnabled: false,
                fields: {}
            };

            [
                '_onChange',
                '_onSave'
            ].map(function (fn) {
                self[fn] = self[fn].bind(self);
            })
        }

        componentDidMount () {
            var self = this;
            var _f = self.state.fields; // _f => Form Engine Module Fields
            var requests = [];
            var fieldKeys = [];

            var processElems = function (rawElem) {
                var tag = rawElem.Type;

                if (tag in tagConverter) {
                    tag = tagConverter[tag];
                } else {
                    tag = tag.toLowerCase();
                }

                if (tag == 'select') {
                    if (!rawElem['DefaultList']) {
                        if (rawElem['ModuleName']) {
                            var TextColumn = rawElem['TextColumn'], ValueColumn = rawElem['ValueColumn'];
                            requests.push({
                                queryData: {
                                    moduleName: rawElem['ModuleName'],
                                    select: [TextColumn, ValueColumn],
                                    optimize: true
                                },
                                callBack: function (res) {
                                    console.log(rawElem, res);
                                    if (res.Status == 'Success') {
                                        rawElem.__options = res.Data.map(i => {
                                            return {
                                                value: i[ValueColumn],
                                                label: i[TextColumn]
                                            };
                                        })
                                    } else {
                                        console.error('Error Occurred', res);
                                    }
                                },
                                fn: 'aggregate'
                            })
                        }
                        
                    }
                    fieldKeys.push(rawElem.Id);
                } else if (tag == 'input') {
                    fieldKeys.push(rawElem.Id);
                }

                var fields = rawElem.Fields;
                if (fields) {
                    fields.map((i, index) => {
                        processElems(i);
                    })
                }
            }

            processElems(fd);

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

            makeRequest();

            var resolve = function () {
                if (Did) {
                    var queryData = {
                        moduleName: fd.PostURL,
                        where: {
                            Did: Did
                        },
                        select: ['Did'].concat(fieldKeys),
                        optimize: true
                    }

                    ServerAPI.aggregate(queryData, function (res) {
                        if (res.Status == 'Success') {
                            var row = res.Data[0];
                            fieldKeys.map(key => {
                                _f[key] = row[key]; // ***State keys (collection of html elements ids should be put inside a single object)
                            })
                        } else {
                            console.error('Error Occurred!', res);
                        }

                        self.setState({
                            formActionEnabled: true
                        });
                        console.log('Form Engine - Module Row Data Loaded!!', res);
                    })
                } else {
                    fieldKeys.map(key => {
                        _f[key] = '';
                    })
                    self.setState({
                        formActionEnabled: true
                    });
                }
            }
        }

        componentDidUpdate () {

        }

        componentWillUnmount () {

        }

        _onChange (e) {
            var targetObj = e.target;
            var id = targetObj.id;
            if (onChange) {
                var _type = typeof onChange;

                if (_type == 'object') {
                    if (id in onChange) {
                        if (typeof onChange[id] == 'function') {
                            onChange[id].call(this, e);
                            return;
                        }
                    }
                } else if (_type == 'function') {
                    onChange.call(this, e);
                    return;
                }
            }

            var fields = this.state.fields;
            fields[id] = targetObj.value;

            this.forceUpdate();
        }

        _onSave (e) {
            var self = this;

            var queryData = {
                moduleName: fd.PostURL,
                data: this.state.fields
            }

            if (Did) {
                queryData.rowDid = Did;
                queryData.type = 'update';
            } else {
                queryData.type = 'insert';
            }

            self.setState({
                formActionEnabled: false
            })

            ServerAPI.modifyModuleData(queryData, function (res) {
                if (res.Status == 'Success') {
                    Did = res.Data;
                    alert("Data saved!\nDid - " + Did);
                } else {
                    console.error('Error Occurred', res);
                }

                self.setState({
                    formActionEnabled: true
                })
            })
           
        }

        render () {
            var self = this;
            var stateObj = this.state;
            var _f = stateObj.fields; // _f => Form Engine Module Fields

            var generateChildren = function (rawElem, key) {
                var tag = rawElem.Type;

                if (tag in tagConverter) {
                    tag = tagConverter[tag];
                } else {
                    tag = tag.toLowerCase();
                }

                if (tag == 'hiddenfield' || tag == 'page') {
                    return null;
                }
               
                var children = [];

                var props = {

                };

                if (typeof key != 'undefined') props.key = key;

                for (var key in rawElem) {
                    if (key in attrConverter) {
                        var val = rawElem[key];
                        if (val == '') continue;
                        var jsKey = attrConverter[key];
                        if (jsKey == 'style') {
                            val = _getCssObject(val);
                        }

                        props[jsKey] = val;
                    }
                }

                // **Temp Purpose

                var tempObj = {};
                for (var key in rawElem) {
                    if (key != 'Fields') {
                        tempObj[key] = rawElem[key];
                    }
                }
                // props['data-fe'] = JSON.stringify(tempObj);



                var fields = rawElem.Fields;
                if (fields) {
                    fields.map((i, index) => {
                        children.push(generateChildren(i, index));
                    })
                } else {
                    if (tag == 'label') {
                        children = rawElem.Value || '';
                    } else if (tag == 'select') {
                        children.push(<option value="" key="__default">--SELECT AN ITEM--</option>);
                        if (rawElem['DefaultList']) {
                            var options = rawElem.DefaultList.split(',');
                            options.map((i, index) => {
                                children.push(<option value={i} key={index}>{i}</option>);
                            })
                        } else if (rawElem['__options']) {
                            rawElem.__options.map(i => {
                                var val = i.value;
                                children.push(<option value={val} key={val}>{i.label}</option>);
                            })
                        }
                        props.value = _f[rawElem['Id']] || ''; // ** Set it before mounting for the first time
                        props.onChange = self._onChange;
                    } else if (tag == 'input') {
                        props.value = _f[rawElem['Id']] || ''; // ** Set it before mounting for the first time
                        props.onChange = self._onChange;
                    } else {
                        children = null;
                    }
                }


                return React.createElement(
                    tag,
                    props,
                    children ? children.length ? children : null : null
                );
            }

            var children = generateChildren(fd);

            return (
                <div>
                    {children}
                    <div
                        style={{
                            float: 'left',
                            clear: 'both',
                            textAlign: 'right',
                            width: '100%',
                            padding: '8px 15px'
                        }}
                        >
                        <button disabled={stateObj.formActionEnabled ? false : true} onClick={this._onSave} className='btn btn-sm btn-success text-right'>Save</button>
                    </div>
                </div>
            );
        }
    }

    return {
        test: ReactFormContainer
    };
}

var _d = JSON.parse(_FormData.Json);
console.log(_d);
var testOnChange = function (e) {

};

var response = test(React, $, {
    Host: 'http://dev-nosql.premisehq.co' + '/api/',
    Premise: 'http://dev-nosql.premisehq.co' + '/',
    AppKey: 'cc3fdca374904ae89e3393779805efaf',
    Key: '201701230138VynxiSBuPB/ZeTeWab1WIA=='
}, '2d5a0832510a413b8e9049969fd52948', _d, {
    onChange: testOnChange
});
console.log(response);