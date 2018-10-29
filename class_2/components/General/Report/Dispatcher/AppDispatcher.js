import {Dispatcher} from 'flux';

// Create dispatcher instance
var AppDispatcher = new Dispatcher();

// Convenient method to handle dispatch requests
AppDispatcher.handleViewAction = function (action) {
    this.dispatch({
        source: 'VIEW_ACTION',
        action: action
    });
    //console.log('appdispatcher: received view action');
};

AppDispatcher.handleServerAction = function (action) {
    this.dispatch({
        source: 'SERVER_ACTION',
        action: action
    });
    //console.log('appdispatcher: received server action');
};

export default AppDispatcher;