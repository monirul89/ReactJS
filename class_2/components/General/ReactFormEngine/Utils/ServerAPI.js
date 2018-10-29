import $ from 'jquery';

// _SA => _ServerAPI

var getServerAPI = function () {
    var Host = '', Premise = '', AppKey = '', Key = '';

    var handleUnauthorizedAccess = function () {
        console.log(err);
    }

    var errorListenerAction = function (err) {
        console.log(err);
    }

    var LoginStore = {
        getLoginData: function () {
            return {
                Key: Key
            }
        }
    }

    var _SA = {
        setVariables: function (data) {
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

            if (!rowDid) {
                if (where && typeof where == 'object' && 'Did' in where && Object.keys(where).length == 1) {
                    rowDid = where.Did;
                    // delete data.where;
                    where = null;
                }
            }

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
                whereQuery = '"Where": \'$and: [{$and: [' + _SA.generateFormDataQuery(where)  + ']}]\'' + ',';
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
                if (_SA.processResponse(receivedData, responseStatus, xhrObj)) {
                
                } 
                if (callBack) callBack(receivedData);
            })
        },

        generateFormDataQuery: function (where) {
            if (typeof where == 'string') {
                return where;
            }

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
            var where = data.where;

            if (!rowDid) {
                if (where && typeof where == 'object' && 'Did' in where && Object.keys(where).length == 1) {
                    rowDid = where.Did;
                    // delete data.where;
                    where = null;
                }
            }

            rowDid = rowDid ? ("/" + rowDid) : "";

            if (!data.type && rowDid && data.where) {
                data.type = 'update';
            }

            if (data.type == 'delete') {
                if (!rowDid) {
                    formData = new FormData();
                    formData.append('query', '{$and:[' + _SA.generateFormDataQuery(where) + ']}');
                    url += "/" + data.moduleName + "/DeleteDataWithCondition?Module=" + data.moduleName + "&Test=12&Test2=212&key=" + key;
                } else {
                    url += "/DeleteData";
                    url += "/" + data.moduleName + rowDid + "?key=" + key;
                }
            } else {
                var inlineTestKeyValue = "";
                formData = new FormData();
                if (where) {
                    formData.append('query', '{$and:[' + _SA.generateFormDataQuery(where) + ']}');

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
                if (_SA.processResponse(receivedData, responseStatus, xhrObj)) {
                
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
                if (_SA.processResponse(receivedData, responseStatus, xhrObj)) {
                    if (callBack) callBack(receivedData);
                } 
            })
        },*/

        aggregate: function (data, callBack) {
            var Condition = [], dataOptimized = false, fieldList = [];
            var condition = data.condition;

            if (condition) {
                Condition = condition;
            } else {
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
            }


            if (!condition && !data.count) {
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
            formData.append("Condition", typeof Condition == 'string' ? Condition : JSON.stringify(Condition));
            formData.append("Distinct", data.distinct || "");
            formData.append("Count", data.count ? 'true' : 'false');

            return $.ajax({
                url: Host + AppKey + "/ModuleData/" + "Aggregate" + "?" + "key=" + LoginStore.getLoginData().Key,
                type: "POST",
                data: formData,
                contentType: false,
                processData: false
            }).always(function (receivedData, responseStatus, xhrObj) {
                if (_SA.processResponse(receivedData, responseStatus, xhrObj)) {
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
        },

        emptyFn: function (data, callBack) {
            if (callBack) callBack();
        }
    }

    return _SA;
}

export default getServerAPI;