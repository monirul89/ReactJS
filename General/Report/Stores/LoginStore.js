import AppDispatcher from "../Dispatcher/AppDispatcher";
import {EventEmitter} from "events";
import _ from 'underscore';
import React from 'react';

import manualAlert from '../Utils/manualPrompter';

var loginStatus = false;
var loginData = null;
var authorizationStatus = true;
var permissionObj = {};
var searchCredentials = {};

var promptUser = function (e) {
    var inputObj = e.target;
    var lastElementChild = document.body.lastElementChild;
    if (!lastElementChild.contains(inputObj) && !lastElementChild.previousElementSibling.contains(inputObj)) {
        manualAlert("Please Log-in!!", "Information", {type: 'primary'});
    }
}

var setUnauthorized = function () {
    authorizationStatus = false;
    window.removeEventListener('click', promptUser);
    window.addEventListener('click', promptUser);
}

var setSearchCredentials = function (data) {
    searchCredentials = data;
}

var elementRight = (
    <div>
        <a className="pull-right" href={"/Home/Login"} style={{height: '50px'}}>
            <i style={{color: '#9D9D9D', marginTop: '15px', marginRight: '10px', marginLeft: '5px', fontSize: '1.7em'}} className="fa fa-power-off"></i>
        </a>
    </div>
);

var setLoginData = function (data) {
    loginStatus = true;
    loginData = data;
    var userName = loginData.FirstName;
    if (!userName) {
        userName = loginData.UserName;
    } else {
        userName = userName + " " + loginData.LastName || "";
    }

    if (userName) { 
        elementRight = (
            <div>
                <span style={{color: 'white', margin: '0px 3px', fontSize: '15px', lineHeight: '50px'}}>{userName}</span>
                <a className="pull-right" href="/Home/Login" style={{height: '50px'}}><i style={{color: '#9D9D9D', marginTop: '15px', marginRight: '10px', marginLeft: '5px', fontSize: '1.7em'}} className="fa fa-power-off"></i></a>
            </div>
        );
    }
}

var setPermissionObj = function (data) {
   permissionObj = data;
}

var LoginStore = _.extend({}, EventEmitter.prototype, {

    internalUpdate: function (functionName, data) {
       eval(functionName + "(data)");
    },

    getLoginStatus: function () {
        return loginStatus;
    },

    getLoginData: function () {
        return loginData;
    },

    getAuthorizationStatus: function () {
        return authorizationStatus;
    },

    getPermissionObj: function () {
        return permissionObj;
    },

    getRightElement: function () {
        return elementRight;
    }, 

    getSearchCredentials: function () {
        return searchCredentials;
    },

    addChangeListener: function(callback) {
        this.on('change', callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener('change', callback);
    },

    emitChange: function () {
        this.emit('change');
    }
});

LoginStore.dispatchToken = AppDispatcher.register(function (payload) {
    var action = payload.action;

    switch (action.actionName) {
        case "SET_LOGIN_DATA":
            setLoginData(action.data);
            break;
        case "SET_SEARCH_CREDENTIALS":
            setSearchCredentials(action.data);
            break;
        case "SET_UNAUTHORIZED":
            setUnauthorized(action.data);
            break;
        default:
            return true;
    }

    LoginStore.emitChange();

    return true;
});

export default LoginStore;