import _ from 'underscore';
import {EventEmitter} from 'events';
import ActionCreator from '../Actions/ActionCreator';
import AppDispatcher from '../Dispatcher/AppDispatcher';
import LoginStore from "./LoginStore";

var dataRetrievedIndex = -2;
var activeMenuItem = "";
var activeMenuArr = [];

var allowedHash = {
	"SomeHash": true
}

var imageStyle = {
    float: 'left',
    width: '20px',
    margin: '8px 5px 0px 0px',
    height: '20px'
}

var navMenuItems = {
	"ReportEngine": {
	    itemName: "Report Engine",
	    list: [],
	    id: "",
	    className: '',
	    img: {
	    	src: null,
	    	style: imageStyle
	    } 
	}
};

var setActiveMenuItem = function () {
	
}

window.addEventListener('popstate', function (e) {
	var locationHash = decodeURIComponent(location.hash).substr(1);
	ActionCreator.setActiveMenuItem(locationHash);
})

var NavStore = _.extend({}, EventEmitter.prototype, {
	getNavMenuItems: function () {
		return navMenuItems;
	},
	getActiveMenuItem: function () {
		return activeMenuItem;
	},
	getDataRetrievedIndex: function () {
		return dataRetrievedIndex;
	},
	getActiveMenuArr: function () {
		return activeMenuArr;
	},
	addChangeListener: function (callBack) {
		this.on('change', callBack);
	},
	removeChangeListener: function (callBack) {
		this.removeListener('change', callBack);
	},
	emitChange: function (callBack) {
		this.emit('change');
	}
})

NavStore.dispatchToken = AppDispatcher.register(function (payload) {
	var action = payload.action;

	switch (action.actionName) {
		case "SET_ACTIVE_MENU_ITEM":
			setActiveMenuItem(action.data);
			break;
		case "SET_NAV_MENU_APPS":
			setNavMenuApps(action.data);
			break;
		case "SET_NAV_MENU_ITEMS":
			setNavMenuItems(action.data);
			break;
		case "INC_DATA_RETRIEVED_INDEX":
			dataRetrievedIndex++;
			return;
		case "RESET_DATA_RETRIEVED_INDEX":
			dataRetrievedIndex = -1;
			return;
		default:
			return true;
	}

	NavStore.emitChange();
	return true;
})

export default NavStore;