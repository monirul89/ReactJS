import React from 'react';
import AppDispatcher from '../Dispatcher/AppDispatcher';
import { EventEmitter } from "events";

var viewMode = false;
var messageNode = null;

var setModalData = function (data) {
    viewMode = data.viewMode ? true : false; 
    messageNode = data.messageNode;
    messageNode = messageNode || null; 
}

var ModalStore = Object.assign({}, EventEmitter.prototype, {
    getData: function () {
        return {
            viewMode: viewMode,
            messageNode: messageNode
        }
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

ModalStore.dispatchToken = AppDispatcher.register(function (payload) {
    var action = payload.action;
    var _d = action.data;

    switch (action.actionName) {
        case "SET_MODAL_DATA":
            setModalData(_d);
            break;
        default:
            return true;
    }

    ModalStore.emitChange();

    return true;
});

export default ModalStore;