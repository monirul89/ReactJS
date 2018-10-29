import AppDispatcher from "../Dispatcher/AppDispatcher";
import {EventEmitter} from "events";
import _ from 'underscore';

var moduleCollectionObj = {data: [], time: -1}, existingModules = {};
var fieldCollectionObj = {};

var setModuleCollection =  function (data, init) {
    moduleCollectionObj = {
        data: data,
        time: Date.now(),
        host: location.host
    };

    existingModules = {};
    data.map(function (item, index) {
        var moduleName = item.ModuleName;
        if (!moduleName) return;
        existingModules[moduleName] = true;
    })

    if (!init && data.length < 1500) { // we can also set a size limit instead
        localStorage.setItem('module_collection', JSON.stringify(moduleCollectionObj));    
    }
};

(function () {
    var tempMCObj = localStorage.getItem('module_collection');
    if (tempMCObj) {
        tempMCObj = JSON.parse(tempMCObj);
        if (tempMCObj.time > Date.now() - 1800000 && tempMCObj.host == location.host) {
            setModuleCollection(tempMCObj.data, true);
        }
    }
}());

var setFieldList = function (data) {
    fieldCollectionObj[data.key] = data.value;
};

var ModuleStore = _.extend({}, EventEmitter.prototype, {

    getModuleCollection: function () {
        return moduleCollectionObj.data;
    },

    getModuleCollectionObj: function () {
        return moduleCollectionObj;
    },

    getMatchedModuleNames: function (len, customModuleName) {
        len = len || 5;
        customModuleName = customModuleName || "";
        customModuleName = customModuleName.toLowerCase();
        var moduleData = moduleCollectionObj.data || [];
        var matchedModuleData = [];

        moduleData.find(function (item, index) {
            var curModuleName = item.ModuleName;
            if (!curModuleName) return;
            curModuleName = curModuleName.toLowerCase();
            if (!len) {
                return true;
            } else if (curModuleName.search(customModuleName) > -1) {
                matchedModuleData.push(item);
                len--;
            }
        })

        return matchedModuleData;
    },

    getFieldList: function (moduleName) {
        return fieldCollectionObj[moduleName] || (existingModules[moduleName] ? [] : null);
    },

    getFieldCollectionObj: function () {
        return fieldCollectionObj;
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

ModuleStore.dispatchToken = AppDispatcher.register(function (payload) {
    var action = payload.action;
    var data = action.data;

    switch (action.actionName) {
        case "SET_MODULE_COLLECTION":
            setModuleCollection(data);
            break;
        case "SET_FIELD_LIST":
            setFieldList(data);
            break;
            // or return to stop emitting change
        default:
            return true;
    }

    ModuleStore.emitChange();

    return true;
});

export default ModuleStore;