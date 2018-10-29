import React from 'react';
import ReactDOM from 'react-dom';
import _ from  'underscore';

import ActionCreator from '../Actions/ActionCreator';
import LoginStore from '../Stores/LoginStore';

import $ from 'jquery/src/ajax';
import 'jquery/src/ajax/xhr';

var Host = "";
var Premise = "";
var Utility = "";

var AppKey = "";

var AppIdString = "ReportComponent"; //

var preStoredModuleFields = {
    //"Inventory_AttachmentList": ["Did","InsertedDate","UpdatedDate","CreatedBy","UpdatedBy","EquipmentId","Url"]
}

var handleUnauthorizedAccess = function () {
    var iframeSrc = "";

    iframeSrc = "/Home/Login";
    if (process.env.NODE_ENV != 'production') {
        iframeSrc = "http://dev.premisehq.co/Home/Login";
    }
    
    document.body.innerHTML = "";

    var newDiv = document.createElement('div');
    newDiv.id = "session-expiry-notifier";
    document.body.appendChild(newDiv);

    class DivComponent extends React.Component {
        constructor (props) {
            super(props);
            this.state = {};
        }

        componentDidMount () {
            var iframeObj = this.iframeObj = document.querySelector("#login-page");
            var iframeWindow = iframeObj.contentWindow;
            var iframeDocument = iframeObj.contentDocument;

            iframeWindow.onbeforeunload = function () {
                window.document.body.style.display = "none";
            };

            iframeObj.addEventListener('load', function () {
                var iframeHeight = iframeObj.contentDocument.body.scrollHeight;
                if (iframeHeight < window.innerHeight - 70) iframeHeight = window.innerHeight;
                iframeObj.style.height = iframeHeight + "px";
                var iframeWindow = iframeObj.contentWindow;
                if (iframeWindow.location.pathname == "/UserInfo/Apps/MyApps") {
                    navigate(iframeWindow.location.origin + "/" + AppIdString + "/index.html" + iframeWindow.location.search + window.location.hash);
                }
            })

        }

        render () {
            var self = this;

            return (
                <div>
                    <div style={{width: '100%', position: 'relative', display: 'inline-block', height: '70px', lineHeight: '70px', backgroundImage: 'linear-gradient(to bottom,#b3d2db 0,#3b616c 100%)', color: 'white', fontSize: '28px', textAlign: 'center'}}>
                        Your session expired! Please Log-in again!
                    </div>
                    <iframe id="login-page" src={iframeSrc} style={{width: '100%', border: 'none'}}>
                        
                    </iframe>
                </div>
            );
        }
    };

    ReactDOM.render(<DivComponent />, newDiv);
}

/*var onlineStatus = true;
var getOnlineStatus = function () {
    $.get('./online-status.txt').always(function (res) {
        console.log(res);
        setTimeout(getOnlineStatus, 120000);
    })
}
getOnlineStatus();*/

var ServerAPI = {
    getDomains: function (data, callBack) {
        var origin = window.location.origin;
        var url = origin + "/APIDomains/Protocols.json";

        //if (process.env.NODE_ENV != 'production' || location.host.search('localhost') > -1) {
        if (location.host.search('localhost') > -1) {
            var data = {  
               // "HTTP":{  
               //    "Premise":"http://demo.premisehq.co",   
               //    "NoSQL":"http://demo-nosql.premisehq.co",
               //    "Utility":"http://demo-win-utility.premisehq.co",
               //    "IsActive":"true"
               // },
               "HTTP":{  
                  "Premise":"http://dev.premisehq.co",   
                  "NoSQL":"http://dev-nosql.premisehq.co",
                  // "NoSQL":"http://52.60.180.67:82",
                  "Utility":"http://dev-utility.premisehq.co",
                  "IsActive":"true"
               },
               "HTTPS":{  
                  "Premise":"180.234.210.75:81",   
                  // "Premise":"https://www2.premisehq.co",
                  // "NoSQL":"https://nosql.premisehq.co",
                  "NoSQL":"180.234.210.75:82",
                  "Utility":"https://utility.premisehq.co",
                  "IsActive":"false"
               }
            }

            // var data = {  
            //    "HTTP":{  
            //       "Premise":"http://demo.premisehq.co",      
            //       "NoSQL":"http://demo-nosql.premisehq.co",
            //       "Utility":"http://utility.premisehq.co",
            //       "IsActive":"false"
            //    },
            //    "HTTPS":{  
            //       "Premise":"https://demo.premisehq.co",
            //       "NoSQL":"https://demo-nosql.premisehq.co",
            //       "Utility":"https://utility.premisehq.co",
            //       "IsActive":"true"
            //    }
            // }

            Object.keys(data).find(function (key) {
                if (data[key].IsActive == "true") {
                    var item = data[key];
                    Host = item.NoSQL + "/api/";
                    Premise = item.Premise + "/";
                    Utility = item.Utility + "/";
                    ActionCreator.incDataRetrievedIndex();
                    return true;
                } else return false;
            })
            if (callBack) callBack(data);
            return;
        }

        $.get(url).done(function (data) {
            Object.keys(data).find(function (key) {
                if (data[key].IsActive == "true") {
                    var item = data[key];
                    Host = item.NoSQL + "/api/";
                    Premise = item.Premise + "/";
                    Utility = item.Utility + "/";
                    ActionCreator.incDataRetrievedIndex();
                    return true;
                } else return false;
            })
            if (callBack) callBack(data);
        }).fail(function (receivedData) {
            ActionCreator.setUnauthorized(receivedData);
        })
    },

    getAppKey: function () {
        return AppKey;
    },

    setAppkey: function (appKey) {
        AppKey = appKey;
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
                ActionCreator.setAPICallError(errorData);
                return false;
            }
        } else {
            if (xhrObj.status == 401) {
                handleUnauthorizedAccess();
                return;
            }
            var errorData = {
                statusText: responseStatus,
                statusCode: xhrObj.status
            };
            ActionCreator.setAPICallError(errorData);
            return false;
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
                if (callBack) callBack(receivedData);
            } 
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
                if (callBack) callBack(receivedData);
            } 
        })
    },

    rawAggregate: function (data, callBack) {
        var Condition = data.Condition;
        Condition.map(function (item, index) {
            Condition[index] = JSON.stringify(item);
        })

        var formData = new FormData();
        formData.append("ModuleKey", data.ModuleKey);
        formData.append("Condition", JSON.stringify(Condition));
        formData.append("Distinct", data.Distinct || "");
        formData.append("Count", data.Count ? 'true' : 'false');

        return $.ajax({
            url: Host + AppKey + "/ModuleData/" + "Aggregate" + "?" + "key=" + LoginStore.getLoginData().Key,
            type: "POST",
            data: formData,
            contentType: false,
            processData: false
        }).always(function (receivedData, responseStatus, xhrObj) {
            if (ServerAPI.processResponse(receivedData, responseStatus, xhrObj)) {
            
            } 
            if (callBack) callBack(receivedData);
        })
    },

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
    },
    
    getUserList: function (data, callBack) {
        var queryData = {
            moduleName: "User System",
            select: ["Did", "Email", "First Name", "Last Name", "User Name"]
        }
        var UserSystemCallBack = function (data) {
            var userList = JSON.parse(data.Data);
            ActionCreator.setUserList(userList);
            if (callBack) callBack(data);
        }
        ServerAPI.getModuleData(queryData, UserSystemCallBack);
    },

    /*getUserPermission: function(data, callBack){
        var queryData = {
            moduleName: 'User Permission',
            where: {
                AppId: AppIdString
            },
            select: ["Did", "UserId", "RoleId"]
        }
        var UserPermissionCallBack = function (data) {
            if (data.Status == "Success") {
                ActionCreator.setUserPermissionList(JSON.parse(data.Data));
                if (callBack) callBack(data);
            }
        }

        ServerAPI.getModuleData(queryData, UserPermissionCallBack);
    },*/

    /*getNavMenuApps: function (data, callBack) {
        if (process.env.NODE_ENV != 'production') {
            var data = {"Status":"Success","Message":"","Data":"[{\"Name\":\"BSOM\",\"Icon\":\"../../Images/NewLogo/premise-library-white.png\",\"Url\":\"/Bsom/BsomInfo/MyManuals\",\"Serial\":\"1\",\"AppKey\":\"ad2bad6a103c4fa28ba2e0016211eb74\",\"AppId\":\"BSOM\",\"AppPermission\":\"2\",\"MenuColor\":\"Red\"},{\"Name\":\"Lease View\",\"Icon\":\"../../Images/NewLogo/stacking-plan-white.png\",\"Url\":\"/StackingPlan/index.html\",\"Serial\":\"2\",\"AppKey\":\"ad2bad6a103c4fa28ba2e0016211eb74\",\"AppId\":\"StackingPlan\",\"AppPermission\":\"2\",\"MenuColor\":\"Red\"},{\"Name\":\"Dashboard\",\"Icon\":\"../../Images/NewLogo/dashboard-white.png\",\"Url\":\"/Dashboard/Dashboard\",\"Serial\":\"3\",\"AppKey\":\"ad2bad6a103c4fa28ba2e0016211eb74\",\"AppId\":\"Dashboard\",\"AppPermission\":\"2\",\"MenuColor\":\"Red\"},{\"Name\":\"Lease Flow\",\"Icon\":\"../../Images/NewLogo/lease-flow-white.png\",\"Url\":\"/LeaseFlow/index.html\",\"Serial\":\"4\",\"AppKey\":\"ad2bad6a103c4fa28ba2e0016211eb74\",\"AppId\":\"LeaseFlow\",\"AppPermission\":\"2\",\"MenuColor\":\"Red\"},{\"Name\":\"Lease Abstractor\",\"Icon\":\"../../Images/NewLogo/lease-abstracto-white.png\",\"Url\":\"/LeaseAbstractor/index.html\",\"Serial\":\"5\",\"AppKey\":\"ad2bad6a103c4fa28ba2e0016211eb74\",\"AppId\":\"LeaseAbstractor\",\"AppPermission\":\"2\",\"MenuColor\":\"Red\"},{\"Name\":\"Place Match\",\"Icon\":\"../../Images/NewLogo/place-match-white.png\",\"Url\":\"/PlaceMatch/index.html\",\"Serial\":\"6\",\"AppKey\":\"ad2bad6a103c4fa28ba2e0016211eb74\",\"AppId\":\"PlaceMatch\",\"AppPermission\":\"2\",\"MenuColor\":\"Red\"},{\"Name\":\"Risk Management\",\"Icon\":\"../../Images/NewLogo/risk-management-white.png\",\"Url\":\"/RiskManagement/index.html\",\"Serial\":\"7\",\"AppKey\":\"ad2bad6a103c4fa28ba2e0016211eb74\",\"AppId\":\"RiskManagement\",\"AppPermission\":\"2\",\"MenuColor\":\"Red\"},{\"Name\":\"AR Dashboard\",\"Icon\":\"../../Images/NewLogo/dashboard-white.png\",\"Url\":\"/ARDashboard/ARDashboard.html\",\"Serial\":\"8\",\"AppKey\":\"ad2bad6a103c4fa28ba2e0016211eb74\",\"AppId\":\"ARDashboard\",\"AppPermission\":\"2\",\"MenuColor\":\"Red\"},{\"Name\":\"Cloud Control\",\"Icon\":\"../../Images/NewLogo/cloud-control-white.png\",\"Url\":\"/CloudControl/index.html\",\"Serial\":\"9\",\"AppKey\":\"ad2bad6a103c4fa28ba2e0016211eb74\",\"AppId\":\"CloudControl\",\"AppPermission\":\"2\",\"MenuColor\":\"Red\"},{\"Name\":\"Asset Inventory\",\"Icon\":\"../../Images/NewLogo/asset-inventory-white.png\",\"Url\":\"/AssetInventory/index.html\",\"Serial\":\"10\",\"AppKey\":\"ad2bad6a103c4fa28ba2e0016211eb74\",\"AppId\":\"AssetInventory\",\"AppPermission\":\"2\",\"MenuColor\":\"Red\"},{\"Name\":\"Preventive Maintenance\",\"Icon\":\"../../Images/NewLogo/premise-OP-white.png\",\"Url\":\"/PM/index.html\",\"Serial\":\"11\",\"AppKey\":\"ad2bad6a103c4fa28ba2e0016211eb74\",\"AppId\":\"PreventiveMaintenance\",\"AppPermission\":\"2\",\"MenuColor\":\"Red\"},{\"Name\":\"Form Engine\",\"Icon\":\"../../Images/NewLogo/cloud-control-white.png\",\"Url\":\"/FE/index.html\",\"Serial\":\"12\",\"AppKey\":\"ad2bad6a103c4fa28ba2e0016211eb74\",\"AppId\":\"FE\",\"AppPermission\":\"2\",\"MenuColor\":\"Red\"},{\"Name\":\"Tenant Request\",\"Icon\":\"../../Images/NewLogo/cloud-control-white.png\",\"Url\":\"/TenantRequest/index.html\",\"Serial\":\"13\",\"AppKey\":\"ad2bad6a103c4fa28ba2e0016211eb74\",\"AppId\":\"TenantRequest\",\"AppPermission\":\"2\",\"MenuColor\":\"Red\"},{\"Name\":\"User System\",\"Icon\":\"../../Images/NewLogo/cloud-control-white.png\",\"Url\":\"/UserSystem/index.html\",\"Serial\":\"14\",\"AppKey\":\"ad2bad6a103c4fa28ba2e0016211eb74\",\"AppId\":\"UserSystem\",\"AppPermission\":\"2\",\"MenuColor\":\"Red\"},{\"Name\":\"GCA\",\"Icon\":\"../../Images/NewLogo/cloud-control-white.png\",\"Url\":\"/GCA/index.html\",\"Serial\":\"14\",\"AppKey\":\"ad2bad6a103c4fa28ba2e0016211eb74\",\"AppId\":\"ChangeRequest\",\"AppPermission\":\"2\",\"MenuColor\":\"Red\"}]"}
            var navMenuApps = JSON.parse(data.Data);
            ActionCreator.setNavMenuApps(navMenuApps);
            if (callBack) callBack();
            return;
        }


        var url = Host + "APIUserPermission/getPermittedApp?" + LoginStore.getLoginData().fullUrlParams;
        $.get(url).done(function (data) {
            var navMenuApps = JSON.parse(data.Data);
            ActionCreator.setNavMenuApps(navMenuApps);
            if (callBack) callBack();
        }).fail(function(jqXHR, textStatus, errorThrown){
            ActionCreator.setUnauthorized(jqXHR);
        });
    },*/

    getUserInfo: function (data, callBack) {
        /*if (process.env.NODE_ENV != 'production') {
            var data = {"Status":"Success","Message":"Success","Data":{"Property":"[]","Company":"[]","UserCategory":"1","UserName":"rdowla","AppKey":"ad2bad6a103c4fa28ba2e0016211eb74","UserType":"SuperUser","UserId":"1","Email":"rdowla@gmail.com","FirstName":"Rafi","LastName":"Dowla","Permission":"[]","AppLogo":"logo.png"}}
            var loginData = LoginStore.getLoginData();
            loginData = _.extend(loginData, data.Data);
            ActionCreator.setLoginData(loginData);
            if (callBack) callBack();
            return;
        }*/


        var url = Host + "APIUserPermission/getUserInfo?" + LoginStore.getLoginData().fullUrlParams + "&UserInfo=1&IsGetPermission=true&AppId=" + AppIdString;
        $.get(url).done(function(data){
            var loginData = LoginStore.getLoginData();
            loginData = _.extend(loginData, data.Data);
            ActionCreator.setLoginData(loginData);
            //console.log(loginData);
            if(callBack) callBack();
        }).fail(function(jqXHR, textStatus, errorThrown){
            ActionCreator.setUnauthorized(jqXHR);
        });
    },

    /*sendEmail: function (data, callBack) {
        var loginData = LoginStore.getLoginData();
        data.FromUserName = loginData.FirstName ? loginData.FirstName + " " + loginData.LastName : loginData.UserName;
        data.Body += "<br/><br/>" + data.FromUserName + "<br/>" + loginData.Email;
        $.ajax({
            type: 'POST',
            contentType: 'application/x-www-form-urlencoded',
            url: Premise + 'api/Mail/SendMail',
            data: data
        }).done(function (data) {
            
        }).always(function (data) {
            if (callBack) callBack(data);
        });
    },*/

    backgroundCallerID: "",
    initiateBackgroundAPICalls: function (data, callBack) {
        var backgroundCallCol = [];
        var currentIndex = -1, totalIndex = backgroundCallCol.length;
        ServerAPI.backgroundCallerID = Math.random();
        var retrieveBGData = function (callerID) {
            if (++currentIndex < totalIndex) {
                ServerAPI[backgroundCallCol[currentIndex]](null, function (res) {
                    if (callerID != ServerAPI.backgroundCallerID) return;
                    //console.log("Background Call, Index Number: " + currentIndex, res.Data); //JSON.parse(res.Data
                    if (currentIndex + 1 < totalIndex) {
                        retrieveBGData(callerID);
                    }
                })
            }
        }
        retrieveBGData(ServerAPI.backgroundCallerID);
    },

    /*getModuleCollection: function (data, callBack) {
        var url = Host + AppKey + '/Modules' + '?Key=' + LoginStore.getLoginData().Key;
        $.ajax({
            url: url,
            method: "GET"
        }).done(function (res) {
            if (res.Status == "Success") {
                //var itemToSet = Host.replace(/http:\/\/|.premisehq.co\/api\/|-nosql/gi, "").toLowerCase();
                //if (itemToSet == "nosql") itemToSet = "live";
                //var currentTime = (new Date()).getTime();
                var parsedData = JSON.parse(res.Data);
                //localStorage.setItem(itemToSet.toLowerCase(), '{"time":' + currentTime + ',"data":' + JSON.stringify(parsedData.reverse()) + '}');
                //var generatedObj = {time: currentTime, data: parsedData};

                ActionCreator.setModuleCollection(parsedData);

                if (callBack) callBack(res);
            } else {
                alert("Module Collection Retrieval failed!!");
            }
            
        }).fail(function (res) {
            alert("Module Collection Retrieval failed!!");
        })

    },*/

    /*getModuleFields: function (reqObj, callBack) {
        var moduleName = "";
        var getModuleInfo = false;
        if (reqObj && typeof reqObj == "object") {
            moduleName = reqObj.moduleName;
            if (reqObj.getModuleInfo === true) getModuleInfo = true;
        } else {
            moduleName = reqObj;
        }
        $.ajax({
            url: Host + AppKey + '/Modules/' + moduleName + '?Key=' + LoginStore.getLoginData().Key,
            method: "GET",
            cache: false,
            contentType: false,
            processData: false
        }).done(function (data) {
            if (data.Status == "Success") {
                var moduleObj = JSON.parse(data.Data);
                if (callBack) {
                    if (getModuleInfo) callBack(moduleObj);
                    else {
                        ActionCreator.setFieldList({key: moduleName, value: moduleObj.ModuleField});
                        if (callBack) callBack(moduleObj.ModuleField);
                    }
                } 
            } else {
                if (callBack) callBack(false);
            }
        })
    },*/

    /*addReport: function (data, callBack) {
        var reportData = {
            Name: data.reportName,
            ApplicationName: data.ApplicationName,
            UserId: LoginStore.getLoginData().UserId
        }

        var queryData = {
            moduleName: 'ReportList',
            data: reportData,
            type: 'insert'
        }

        ServerAPI.modifyModuleData(queryData, function (res) {
            ActionCreator.addNewReport(reportData);
            if (callBack) callBack(res);
        })
    },*/

    /*addReportDetails: function (data, callBack) {
        var reportDetailsData = data.details.map(function (item) {
            return {
                Code: escape(item.code),
                Details: escape(item.details),
                Module: item.moduleName,
                Field: item.field.name,
                MID: data.MID
            };
        })

        var queryData = {
            moduleName: 'ReportListDetails',
            data: reportDetailsData,
            type: 'insert'
        }

        ServerAPI.modifyModuleData(queryData, function (res) {
            if (res.Status == "Success") {
                // Handle success
                //ActionCreator.addReportDetails({})
            }

            if (callBack) callBack(res);
        })

    }*/

    getPropertyManagerList: function (data, callBack) {
        // Well we can fetch the Role Did from Premise_Role module first, but not needed now i believe! 

        var queryData = {
            moduleName: 'User System',
            select: ['Did', 'First Name', 'Last Name'],
            where: {
                RoleList: {
                    $regex: '9bc210cb4234482db0d4a73b98f6f66e'
                }
            },
            optimize: true
        }

        ServerAPI.aggregate(queryData, function (res) {
            if (res.Status == 'Success') {
                ActionCreator.setPropertyManagerList(res.Data);
            }

            if (callBack) callBack(res);
        })
    },

    getCityList: function (data, callBack) {
        var queryData = {
            moduleName: 'Inventory_Building',
            group: {
                _id: {
                    'City': '$City'
                },
                City: {$first: '$City'}
            }
        }

        ServerAPI.aggregate(queryData, function (res) {
            if (res.Status == 'Success') {
                ActionCreator.setCityList(JSON.parse(res.Data));
            }

            if (callBack) callBack(res);
        })
    },

    getPropertyList: function (data, callBack) {
        var queryData = {
            moduleName: 'Inventory_Building',
            select: ['Did', 'BuildingName'],
            optimize: true
        }

        ServerAPI.aggregate(queryData, function (res) {
            if (res.Status == 'Success') {
                ActionCreator.setPropertyList(res.Data);
            }

            if (callBack) callBack(res);
        })
    },

    getRequestList: function (data, callBack) {
        var queryData = {
            moduleName: 'Request_Type_Master',
            select: ['Did', 'RequestType'],
            optimize: true
        }

        ServerAPI.aggregate(queryData, function (res) {
            if (res.Status == 'Success') {
                ActionCreator.setRequestList(res.Data);
            }

            if (callBack) callBack(res);
        })
    },

    getTenantList: function (data, callBack) {
        var queryData = {
            ModuleKey: 'Company_Building',
            Condition: [
                {
                    $match: {
                        Building: data.MID
                    }
                },
                {
                    $group: {
                        _id: {"TenantName": '$TenantName'},
                        "0": {$first: '$Did'},
                        "1": {$first: '$TenantName'},
                        "2": {$first: '$CompanyId'}
                    }
                }
            ]
        }

        ServerAPI.rawAggregate(queryData, function (res) {
            if (res.Status == "Success") {
                res.Data = JSON.parse(res.Data).map(function (item) {
                    return {Did: item["0"], TenantName: item["1"], CompanyId: item['2']};
                })

                ActionCreator.addTenant({
                    key: data.MID,
                    data: res.Data
                })
            }
            if (callBack) callBack(res);
        })
    },

    getTenantAddressBook: function (data, callBack) {
        var url = Host + 'TR/getTenantAddressBook?' + LoginStore.getLoginData().fullUrlParams;
        var formData = new FormData();
        formData.append('PropertyBuildingId', data.PropertyBuildingId);
        formData.append('TenantId', JSON.stringify(data.TenantId));

        $.ajax({
            type: 'POST',
            url: url,
            data: formData,
            contentType: false,
            processData: false
        }).always(function (receivedData, responseStatus, xhrObj) {
            if (ServerAPI.processResponse(receivedData, responseStatus, xhrObj)) {
                console.log(receivedData);
            } 
            if (callBack) callBack(receivedData);
        })
    },

    getPDF: function (data, callBack) {
        var url = Utility + "api/Utility/PdfGenerate?IsHtml=true";
        var formData = new FormData();
        var commands = "--user-style-sheet " + Utility + "Upload/ExternalFile/bootstrap.min.css";

        var config = data.config;
        if (config) {
            var size = config.size;
            if (size == "Custom") {
                commands += " --page-width " + config.width + " --page-height " + config.height;
            } else {
                commands += " --page-size " + size;
                if (config.orientation) {
                    commands += " --orientation " + config.orientation;
                }
            }
        }

        // commands += " --encoding 'UTF-8'";

        //alert(commands)
        // formData.append("Commands", commands);
        formData.append("Html", data.html);
        formData.append("Commands", commands);
        formData.append("Name", data.name || "Sample");
        $.ajax({
            url: url,
            method: "POST",
            data: formData,
            //cache: false,
            contentType: false,
            processData: false,
            timeout: 20000
        }).done(function( data, textStatus, jqXHR ) {
            if (data.Status == "Success") {
                var url = data.Data + '?_=' + Date.now();
                window.open(url);
                if (callBack) callBack(url);
            } else {
                alert("Data Retrieval Failed!");
            }
        }).fail(function( jqXHR, textStatus, errorThrown ){
            if (textStatus == "timeout") {
                if (callBack) callBack("timeout");
                /*var recipients = ["codemen.salman@gmail.com", "ahossain@codemen.com", "codemen.koushik@gmail.com", "codemen.rifat@gmail.com", "codemen.plabon@gmail.com"];
                var subject = "Lease Flow Report Generation Failure!";
                var headerStyle = 'style="padding:10px;font-size:14px;font-weight:bold;"';
                var infoStyle = 'style="padding:10px;font-size:14px;"';

                var body = `
                    <table>
                        <tbody>
                            <tr>
                                <td ${headerStyle}>Link</td>
                                <td ${infoStyle}>${window.location.href.replace("Lease Report", "Lease%20Report").replace("localhost:3001/", "www2.premisehq.co/LeaseFlow/index.html")}</td>
                            </tr>
                            <tr>
                                <td ${headerStyle}>Time</td>
                                <td ${infoStyle}>${(new Date()).toLocaleString(true, {month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'long', weekday: 'long'})}</td>
                            </tr>
                        </tbody>
                    </table>
                `;

                var data = {
                    To: recipients.toString(),
                    Subject: "Lease Flow Report Generation Failure!",
                    Body: body,
                    FromUserName: "Auto-Generator"
                }
                ServerAPI.sendEmail(data);
                */
            } else {
                if (callBack) callBack('fail');
            }
        })
    },

    getTRReport: function (data, callBack) {
        var loginData = LoginStore.getLoginData();
        var url = Premise + "api/TRReport/" + data.apiFn + "?AppKey=" + loginData.AppKey + "&key=" + loginData.Key;
        var formData = new FormData();

        var formDataVals = data.data;
        Object.keys(formDataVals).map(function (key) {
            formData.append(key, formDataVals[key]);
        })

        $.ajax({
            type: 'POST',
            url: url,
            data: formData,
            contentType: false,
            processData: false
        }).done(function (res) {
            if (callBack) callBack(res);
        }).fail(function (res) {
            // Will need to handle error here!
        })

    },

    getRequestTypes: function (data, callBack) {
        var queryData = {
            ModuleKey: 'Tenant_Request',
            Condition: [
                {
                    $group: {
                        "_id": {
                            "RequestTypeID": "$RequestType"
                        },
                        "0": {$first: "$RequestTypeText"}
                    }
                }
            ]
        }

        ServerAPI.rawAggregate(queryData, function (res) {
            if (callBack) callBack(res);
        })
    },

    deleteReportStructure: function (where, callBack) {
        var queryData = {
            moduleName: 'SavedReports',
            where: where,
            type: 'delete'
        }

        ServerAPI.modifyModuleData(queryData, function (res) {
            if (res.Status == "Success") {

            }
            if (callBack) callBack(res);
        })
    },

    saveReportStructure: function (data, callBack) {
        data.UserId = LoginStore.getLoginData().UserId;

        var queryData = {
            moduleName: 'SavedReports',
            data: data
        }

        ServerAPI.deleteReportStructure({
            MID: data.MID,
            UserId: data.UserId,
            ReportName: data.ReportName,
            StructureName: data.StructureName
        }, function (res) {
            if (res.Status == 'Success') {
                ServerAPI.modifyModuleData(queryData, function (res) {
                    if (res.Status == "Success") {

                    }
                    if (callBack) callBack(res);
                })
            }
        })

    },

    loadReportStructure: function (data, callBack) {
        var queryData = {
            moduleName: 'SavedReports',
            optimize: true
        }

        if (typeof data == 'string') {
            queryData.where = {
                Did: data
            };
            queryData.select = ['Did', 'Data', 'StructureName'];
        } else {
            queryData.where = {
                UserId: LoginStore.getLoginData().UserId,
                MID: data.MID
            };
            queryData.select = ['Did', 'StructureName'];
        }

        ServerAPI.aggregate(queryData, function (res) {
            if (res.Status == "Success") {

            }
            if (callBack) callBack(res);
        })
    }
};

export default ServerAPI;

/*


*/