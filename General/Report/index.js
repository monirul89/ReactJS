import React, { Component } from 'react';
import Snackbar from 'node-snackbar';
import Modal from './Components/General/Modal';


import ActionCreator from './Actions/ActionCreator';

import Loader from "./Components/General/Loader";

import Report from './Components/Report';

import LoginStore from "./Stores/LoginStore";
import NavStore from "./Stores/NavStore";
import ModalStore from "./Stores/ModalStore";

import ServerAPI from './Utils/ServerAPI';
import docCookies from './Utils/docCookies';
//import "./Utils/globalFunctions";
import __sp__ from 'smoothscroll-polyfill';
__sp__.polyfill();

var keyValuePair = {};

var location = window.location;

var getParams = location.search.substr(1);
getParams.split('&').map(function (item) {
    var splitterIndex = item.indexOf('='); 
    keyValuePair[item.substr(0, splitterIndex)] = item.substr(splitterIndex + 1);
});

var searchCredentials = JSON.parse(JSON.stringify(keyValuePair));
ActionCreator.setSearchCredentials(searchCredentials);

var _cookieToken = docCookies.getItem('Token');
if (_cookieToken) {
    _cookieToken = JSON.parse(_cookieToken)[0];
    if (!keyValuePair.AppKey && _cookieToken.Appkey) keyValuePair.AppKey = _cookieToken.Appkey.replace(/@/g, "=");
    if (!keyValuePair.Key && _cookieToken.Key) keyValuePair.Key = _cookieToken.Key.replace(/@/g, "=");
    //if (!keyValuePair.Key && _cookieToken.Key) keyValuePair.Key = _cookieToken.Key.replace(/@/g, "=");
}

var cookieData = JSON.parse(docCookies.getItem('ReportComponentLoginData')) || {};

if (keyValuePair.AppKey) cookieData.AppKey = keyValuePair.AppKey;
if (keyValuePair.Key) cookieData.Key = keyValuePair.Key;

docCookies.setItem('ReportComponentLoginData', JSON.stringify(cookieData));
//if (keyValuePair.DID) cookieData.DID = keyValuePair.DID; // Incase there is a form-engine form attached!
cookieData.fullUrlParams = "AppKey=" + cookieData.AppKey + "&Key=" + cookieData.Key; 
// It is actually not the full url params, 
// since it was developed like this before and 
// some values are dependent on this 'fullUrlParams' key, 
// we are sticking to it currently, should change in the future

ActionCreator.setLoginData(cookieData);
ServerAPI.setAppkey(cookieData.AppKey);

///* For now lets remove the annoying appkey and key
//history.replaceState(history.state, "", location.origin + location.pathname + location.hash);
//*/

var dataRetrieverFunction = ['getDomains', 'getUserInfo'/*, 'getUserList', 'getUserPermission'*/];
var dataRetrievedIndex = -1;
// var dataLoaderTitle = ["Retrieving Domains", 'User Validation Processing'/*, 'Retrieving User List', "Retrieving User Permission"*/];
var dataLoaderTitle = ["", ''/*, 'Retrieving User List', "Retrieving User Permission"*/];

//var callBackQueue = [], callBackEngaged = false;

var viewUpdateRequired = false;
export default class App extends Component {
    constructor (props) {
        super(props);

        // **Temporary adjustment
        if (props.AppKey) {
            cookieData.AppKey = props.AppKey;
            ServerAPI.setAppkey(props.AppKey);
        }

        if (props.Key) {
            cookieData.Key = props.Key;
        }

        // **End of Temporary adjustment

        cookieData.fullUrlParams = "AppKey=" + cookieData.AppKey + "&Key=" + cookieData.Key;
        ActionCreator.setLoginData(cookieData);

        ActionCreator.resetDataRetrievedIndex();

        var modalData = ModalStore.getData();

        this.state = {
            ajaxCalled: false,
            viewMode: modalData.viewMode,
            messageNode: modalData.messageNode,
            loaderState: 'transit',
            loaderTitle: 'Component rendering in progress!'
        }

        this.componentCallBack = this.componentCallBack.bind(this);
        this._changeHandler = this._changeHandler.bind(this);
        this._closeDialog = this._closeDialog.bind(this);
    }

    _changeHandler () {
        var data = ModalStore.getData();
        var newMode = data.viewMode;
        if (this.state.viewMode != newMode) {
            this.setState({
                viewMode: newMode,
                messageNode: data.messageNode
            })
        }
    }

    _closeDialog () {
        ActionCreator.setModalData({viewMode: false});
    }

    componentDidMount () {
        if (viewUpdateRequired) {
            viewUpdateRequired = false;
            this.componentCallBack('all', function () {
                this.setState({ajaxCalled: true});
            }.bind(this));
        }
        ModalStore.addChangeListener(this._changeHandler);
    }

    componentWillUnmount () {
        ModalStore.removeChangeListener(this._changeHandler);
    }

    render() {
        var self = this;
        var stateObj = this.state;
        var props = this.props;

        var ajaxCalled = stateObj.ajaxCalled;
        var currentView = "";
        var componentToRender;

        switch (currentView) {
            default:
                if (ajaxCalled) {
                    /*componentToRender = (
                        <div className="col-sm-12 text-center" style={{verticalAlign: 'middle', paddingTop: '100px', minHeight: '500px', fontSize: '22px'}}>
                            Sorry, couldn't find what you were looking for!
                        </div>
                    );*/
                    componentToRender = (
                        <Report 
                            // Did={props.Did || null}
                            // url={props.url || null}
                            // filter={props.filter || false}
                            // fieldExcludable={props.fieldExcludable || false}
                            // application={props.application || ""}
                            // name={props.name || ""}
                            // showChart={props.showChart || false}
                            // downloadable={props.downloadable || false}
                            // rowEditable={props.rowEditable || false}
                            // callBack={props.callBack || null}
                            // sum={props.sum || false}
                            // customFilterState={props.customFilterState || false}
                            // customName={props.customName || false}
                            // modifier={props.modifier || null}
                            {...props}
                            />
                    );


                } else {
                    viewUpdateRequired = true;
                    componentToRender = <div />
                }
                break;
        }

        var viewMode = stateObj.viewMode;

        return (
            <div className="row">
                <Loader data={{state: stateObj.loaderState, title: ''}} masterLoader={true}/>
                <div className="col-sm-12" style={{float: 'none', margin: 'auto'}}>
                        {componentToRender}
                        {/*<ReportLibrary
                            NoSQL="http://dev-nosql.premisehq.co/api/"
                            name="Test Report"
                            application="Lease Flow"
                            filter
                            fieldExcludable

                            />*/}
                </div>

                <Modal
                    open={viewMode}
                    onHideRequest={this._closeDialog}
                    rootStyle={{
                        zIndex: '1600'
                    }}
                    innerContainerStyle={{
                        minHeight: null
                    }}
                    >
                    <div style={{fontSize: '1.4em', fontWeight: 'bold', borderBottom: '1px solid #ccc', padding: '8px 15px', color: '#bbb'}}>
                        Alert
                    </div>
                    <div style={{padding: '5px 10px', fontSize: '1.1em'}}>
                        {stateObj.messageNode || <div style={{visibility: 'hidden'}}>Place to present a notifier message!</div>}
                    </div>
                </Modal>

            </div>
        );
    }

    componentCallBack (required, childCallBack) {
        if (required == "all") {
            required = dataRetrieverFunction.length - 1;
        } else if (typeof required == "string") {
            required = dataRetrieverFunction.indexOf(required);
            if (required == -1) {
                console.warn("There is no such ServerSide function to execute!");
                return false;
            }
        }
        
        var self = this;
        var currentIndex = NavStore.getDataRetrievedIndex();
        var retrieveData = function (currentIndex) {
            // self.setState({
            //     loaderState: 'loading',
            //     loaderTitle: dataLoaderTitle[currentIndex]
            // })

            Snackbar.show({
                pos: 'bottom-left',
                text: dataLoaderTitle[currentIndex] || 'Please Wait...',
                showAction: false,
                duration: 0
            });

            ServerAPI[dataRetrieverFunction[currentIndex]](null, function () {
                if (currentIndex == dataRetrieverFunction.length - 1) {
                    ServerAPI.initiateBackgroundAPICalls();
                }

                if (currentIndex < required) {
                    retrieveData(currentIndex + 1);
                } else {
                    // self.setState({
                    //     loaderState: 'done',
                    //     loaderTitle: "Required data loaded"
                    // })

                    Snackbar.close();

                    if (childCallBack) childCallBack();
                }
            })
        }

        if (currentIndex < required) {
            retrieveData(currentIndex + 1);
            return true;
        } else {
            return false;
        }
    }
}




