import AppDispatcher from "../Dispatcher/AppDispatcher";
import {EventEmitter} from "events";
import _ from 'underscore';

var recheckThreshold = 3600000;
//var requestListObj = {data: [], time: -recheckThreshold};
var reportObj = {};
var reportDetails = {
    Structure: []
};


/* ***Temporary Common-purpose storage */

var graphUtilityLoadState = 0;
// 0 -> Not even initialized
// 1 -> Interactive (Called but content not yet fetched!)
// 2 -> Complete and executed

/* ***Temporary Common-purpose storage (enclosed) */ 



var setReportBasics = function (data) {
    reportObj = data;
}

var setReportStructure = function (data) {
    reportDetails.Structure = data;
}

var ReportStore = _.extend({}, EventEmitter.prototype, {

    checkIfUpdateRequired: function (key, MID) {
        var curDateTime = Date.now();
        if (key == 'propertyManager') {
            return propertyManagerListObj.time + recheckThreshold < curDateTime;
        } else if (key == 'city') {
            return cityListObj.time + recheckThreshold < curDateTime;
        } else if (key == 'property') {
            return propertyListObj.time + recheckThreshold < curDateTime;
        } else if (key == 'request') {
            return requestListObj.time + recheckThreshold < curDateTime;
        } else if (key == 'tenant') {
            if (!MID) return false;
            var obj = tenantListObj[MID];
            return obj ? tenantListObj[MID].time + recheckThreshold < curDateTime : true;
        } else return false;
    },

    getSpecificReportDetails: function (Did) {
        return reportDetails;
    },

    getCurrentReport: function () {
        return reportObj;
    },

    getGraphUtilityLoadState: function () {
        return graphUtilityLoadState;
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

ReportStore.dispatchToken = AppDispatcher.register(function (payload) {
    var action = payload.action;
    var data = action.data;

    switch (action.actionName) {
        case "SET_REPORT_STRUCTURE":
            setReportStructure(data);
            return;

        case "SET_REPORT_BASICS":
            setReportBasics(data);
            return;

        case "SET_GRAPH_UTILITY_LOAD_STATE":
            graphUtilityLoadState = data;
            break;
        default:
            return true;
    }

    ReportStore.emitChange();

    return true;
});

export default ReportStore;