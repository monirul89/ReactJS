import AppDispatcher from "../Dispatcher/AppDispatcher";
import {EventEmitter} from "events";
import _ from 'underscore';

var APICallErrorData = {};

var setAPICallError = function (data) {
    APICallErrorData = data;
}

var XHRStore = _.extend({}, EventEmitter.prototype, {

    getAPICallErrorData: function () {
        return APICallErrorData;
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

XHRStore.dispatchToken = AppDispatcher.register(function (payload) {
    var action = payload.action;

    switch (action.actionName) {
        case "SET_API_CALL_ERROR":
            setAPICallError(action.data);
            break;
        default:
            return true;
    }

    XHRStore.emitChange();

    return true;
});

export default XHRStore;