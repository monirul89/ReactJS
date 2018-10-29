import React from 'react';
import SettingAction from '../actions/Setting.action';
import UserAction from '../actions/User.action';
import CommonApi from '../utils/ServerApi/CommonApi';
import Navigator from './Navigator.react';
import TopMenuAction from '../actions/TopMenu.action';
import { getDataFromJsonFile, getQueryStringValue, getSearchPairs, getSearchStr } from '../utils/CommonUtils';
import { ApiHandler } from 'cm-apptudio-api-sdk';

import { Switch, Route } from 'react-router-dom';
import ConatctList from './Page/List';
import CreateContact from './Page/CreateContact';
import docCookies from '../utils/docCookies';
import SettingStore from '../stores/Setting.store';
import CommonAction from '../actions/Common.action';
import CommonStore from '../stores/Common.store';
import UserStore from '../stores/User.store';
import SessionValidate from '../utils/SessionValidate';
import ServerAPI from '../utils/ServerApi/ServerAPI';
import Snackbar from 'node-snackbar';

import Notification from './Page/Notification.js';
import EmployeeList from './Page/EmployeeTableForm';


// component import list
////////////////////////
import BasicTemplate from './Page/BasicTemplate';
import FormTemplate from './Page/FormTemplate';
import Listing from './Page/Listing';
import TestFormTable from './Page/TestFormTable';
import TestForm from './Page/TestForm';
//////////////


import { LoginModal, AlertBox, ChangePassword } from 'cm-apptudio-ui';

window.isopenLoginAlert = false;
window.opeLoginModel = function () {
    isopenLoginAlert = false;
    AlertBox.close();
    CommonAction.openLoginBox(true);
}
window.openLoginAlertBox = function () {
    isopenLoginAlert = true;
    AlertBox.show({
        HeaderText: "Session Expired!!",
        BodyText: 'Session Expired, Please login again to renew your session. For login' + "<a style='margin-left:5px; cursor:pointer' onClick='opeLoginModel()'>click here.</a>",
        Type: "danger",
        IsAutoHide: false,
        IsCloseButtonShow: false,
        backdrop: true
    });
}

if (docCookies.hasItem('Token')) {
    var Token = docCookies.getItem('Token');
    var internalTokenData = docCookies.getItem('internalTokenData');

    if (!internalTokenData || JSON.parse(internalTokenData).prevToken != Token) {
        internalTokenData = {
            prevToken: Token,
            Token: Token,
            // time: Date.now()
        }
        docCookies.setItem('internalTokenData', JSON.stringify(internalTokenData));
    }
}





export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            initialized: false
        }

        this.componentWillMount = this.componentWillMount.bind(this);
    }
    componentDidMount() {
        SessionValidate.validate();
    }

    componentWillMount() {
        var self = this;

        Snackbar.show({
            pos: 'bottom-left',
            text: 'Loading user information',
            showAction: false,
            duration: 0
        });


        getDataFromJsonFile(this.getDomain() + "/APIDomains/Protocols.json", true, function (text) {
            var data = JSON.parse(text);
            var apiUrl = "";
            var premiseUrl = "";
            var tempAppKeyAndKey = self.getAppKeyAndKey();
            var appKey = tempAppKeyAndKey.AppKey;
            var key = tempAppKeyAndKey.Key;
            if (data.HTTPS.IsActive == "true") {
                apiUrl = data.HTTPS.NoSQL;
                premiseUrl = data.HTTPS.Premise;
            } else {
                apiUrl = data.HTTP.NoSQL
                premiseUrl = data.HTTP.Premise;
            }

            var setting = { Key: key, AppKey: appKey, NosqlUrl: apiUrl, PremiseUrl: premiseUrl };
            ServerAPI.setVariables({
                Host: apiUrl,
                Premise: premiseUrl,
                AppKey: appKey,
                Key: key
            })

            SettingAction.setBasicSetting(setting);
            var apiHandler = new ApiHandler(apiUrl, appKey, key);
            apiHandler.getUserInfo("EnergyAdvantage", function (userInfo) {
                if (userInfo.Status == "Success") {
                    Snackbar.close();
                    Snackbar.show({
                        pos: 'bottom-left',
                        text: 'Loading permitted app',
                        showAction: false,
                        duration: 0
                    });
                    //AlertBox.changeText("Loading permitted app");
                    CommonApi.getMenuItems(function () { });
                    self.setState({ isLoading: true });
                    var data = userInfo.Data;
                    UserAction.setUserInfo(userInfo.Data);

                    var reportPath = self.props.location.pathname.search(/\/report/) == 0;

                    apiHandler.getPermittedApp(data.UserType, function (returnPermittedApp) {
                        TopMenuAction.AddPermittedApp(returnPermittedApp.Data);
                        window.dispatchEvent(new Event('popstate'));

                        if (reportPath) {
                            self.setState({
                                initialized: true
                            })
                        } else {
                            Snackbar.close();
                        }
                    });

                    if (!reportPath) {
                        self.setState({
                            initialized: true
                        })
                    }
                } else {
                    Snackbar.close();
                    Snackbar.show({
                        pos: 'bottom-left',
                        text: 'Something went wrong. please try again later.',
                        showAction: false,
                        duration: 0
                    });

                }
            });


        });
    }

    getDomain() {
        var domain = document.location.origin;
        return domain.includes("localhost") ? "http://dev.premisehq.co" : domain;
    }

    getAppKeyAndKey() {
        var settings = SettingStore.getAll() || {};

        let key = settings.Key || getQueryStringValue('Key') || '';
        let appKey = settings.AppKey || getQueryStringValue('AppKey') || '';

        if ((key == null || key == "") || (appKey == null || appKey == "")) {
            try {
                var data = docCookies.getItem("internalTokenData");
                var tempData = JSON.parse(JSON.parse(data).Token);
                key = tempData[0].Key;
                key = key.replace(/@/g, "=");
                appKey = tempData[0].Appkey;
            } catch (ex) {
                openLoginAlertBox();
            }

        } else {
            this.setCookie("Token", JSON.stringify([{ "Appkey": appKey, "Key": key }]), 3);
        }

        return { AppKey: appKey, Key: key };
    }

    setCookie(key, value, exDays) {
        return;
        if (docCookies.hasItem(key)) {
            return;
        }
        var parameters = [key, value];
        if (exDays) {
            var d = new Date();
            d.setTime(d.getTime() + (exDays * 24 * 60 * 60 * 1000));
            parameters.push(d);
        }
        docCookies.setItem.apply(null, parameters);
    }

    render() {
        return (
            <div className="row">
                <LoginModal callBack={this.componentWillMount} docCookies={docCookies} SettingStore={SettingStore} SettingAction={SettingAction} CommonAction={CommonAction} CommonStore={CommonStore} CommonUtils={{ getSearchPairs, getSearchStr }} />
                <TopMenu />
                {this.state.initialized ?
                    <div
                        className='col-md-12'>
                        <Switch>
                            
                            <Route path="/" exact name="Notification" component={Notification} />
                            <Route path="/Notification" name="Notification" component={Notification} />
                            <Route path="/ConatctList" name="Dashboard" component={ConatctList} />
                            <Route path="/CreateContact" name="CreateAccount" component={CreateContact} />
                            <Route path="/ChangePassword" name="ChangePassword" render={() => <ChangePassword SettingStore={SettingStore} UserStore={UserStore} />} />
                            <Route path="/reports/TestFormTable" name="New Test Menu" component={TestFormTable} />
                            <Route path="/reports/TestForm" name="New Test From" component={TestForm} />
                            <Route path="/reports/EmployeeList" name="Employee List" component={EmployeeList} />

                            // insert routings for components
                            <Route path="/basic_template" name="Basic Template" component={BasicTemplate} />
                            <Route path="/list_page" name="Listing Template" component={Listing} />
                            <Route path="/form_template" name="Form Template" component={FormTemplate} />

                            {/*ReportRouteComp*/}
                        </Switch>
                    </div>
                    :
                    null
                }
            </div>
        )
    }
}

const TopMenu = (props) => (<div style={{ marginBottom: '20px' }} id="Top-Area" ><Navigator /></div>);
