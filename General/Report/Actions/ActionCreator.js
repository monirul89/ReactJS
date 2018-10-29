import AppDispatcher from '../Dispatcher/AppDispatcher';
import AppConstants from '../Constants/AppConstants';

var dispatcherFunction = function (actionName, data) {
    AppDispatcher.handleViewAction({
        actionName: actionName,
        data: data
    })
}

var ActionCreator = {
    
    setLoginData: function (data) {
        dispatcherFunction("INC_DATA_RETRIEVED_INDEX", data);
        dispatcherFunction("SET_LOGIN_DATA", data);
    },

    setSearchCredentials: dispatcherFunction.bind(this, "SET_SEARCH_CREDENTIALS"),

    incDataRetrievedIndex: dispatcherFunction.bind(this, "INC_DATA_RETRIEVED_INDEX"),

    resetDataRetrievedIndex: dispatcherFunction.bind(this, "RESET_DATA_RETRIEVED_INDEX"),

    setUnauthorized: dispatcherFunction.bind(this, "SET_UNAUTHORIZED"),
    
    setActiveMenuItem: dispatcherFunction.bind(this, "SET_ACTIVE_MENU_ITEM"),
    
    //showFileViewer: dispatcherFunction.bind(this, "SHOW_FILE_VIEWER"),

    setAPICallError: dispatcherFunction.bind(this, "SET_API_CALL_ERROR"),

    setReportStructure: dispatcherFunction.bind(this, "SET_REPORT_STRUCTURE"),

    setReportBasics: dispatcherFunction.bind(this, "SET_REPORT_BASICS"),

    setGraphUtilityLoadState: dispatcherFunction.bind(this, "SET_GRAPH_UTILITY_LOAD_STATE"),

    setModalData: dispatcherFunction.bind(this, "SET_MODAL_DATA")

};

export default ActionCreator;
