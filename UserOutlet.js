import React, { Component } from 'react';

import LoginStore from '../stores/User.store.js';
import SettingStore from '../stores/Setting.store.js';
var userProfileKey = 'Show_User_Profile_00089';
var companyProfileKey = 'Show_Company_Profile_00088';
import { Redirect } from 'react-router-dom';
if (window.location.host.search('demo') > -1) {
    userProfileKey = 'Show_User_Profile_00087';
    companyProfileKey = 'Show_Company_Profile_00086';
}

export default class UserOutlet extends Component {

    constructor (props) {
        super(props);

        var userInfo = LoginStore.getLoginData();
        var Permission = (userInfo && userInfo.Permission) || "[]";
        Permission = JSON.parse(Permission);

        this.state = {
            userInfo: userInfo,
            showUserProfile: Permission.find(function (i) {return i.PermissionKey == userProfileKey}),
            showCompanyProfile: Permission.find(function (i) {return i.PermissionKey == companyProfileKey}),
            expandInfo: false,
            popUp: "",
            redirectTo: null
        }

        this._outsideClickCheck = this._outsideClickCheck.bind(this);
        this._showInfoContainer = this._showInfoContainer.bind(this);
        this._onChange = this._onChange.bind(this);
        this._showUserProfile = this._showUserProfile.bind(this);
        this._showCompanyProfile = this._showCompanyProfile.bind(this);
        this._closePopUp = this._closePopUp.bind(this);
        this._onIframeLoad = this._onIframeLoad.bind(this);
    }

    _outsideClickCheck (e) {
        if (this.state.expandInfo) {
            if (!this.refs['container'].contains(e.target)) {
                this.setState({expandInfo: false});
            }
        }
    }

    _showInfoContainer (e) {
        if (!this.state.expandInfo) {
            this.setState({
                expandInfo: true
            })
        }
    }

    _showUserProfile () {
        var userInfo = this.state.userInfo;

        var origin = window.location.origin;
        if (origin.search('localhost') > -1) origin = "http://dev.premisehq.co";

        var Key =  SettingStore.getKey();
        var url = origin + "/Home/UserProfile?AppKey=" + SettingStore.getAppKey() + "&Key=" + Key + "&Did=" + userInfo.UserId;

        this.setState({
            popUp: url
        })
    }

    _showCompanyProfile () {
        var userInfo = this.state.userInfo;

        var origin = window.location.origin;
        if (origin.search('localhost') > -1) origin = "http://dev.premisehq.co";

        var url = origin + "/Home/CompanyProfile?AppKey=" + SettingStore.getAppKey() + "&Key=" + SettingStore.getKey() ;

        this.setState({
            popUp: url
        })
    }

    _closePopUp () {
        setTimeout(function () {
            this.setState({popUp: ""});
        }.bind(this), 20);
    }

    _onIframeLoad (e) {
        var iframe = e.target;
        iframe.style.height = iframe.contentDocument.body.offsetHeight + "px";
    }

    _onChange () {
        var userInfo = LoginStore.getLoginData();
        var Permission = (userInfo && userInfo.Permission) || "[]";
        Permission = JSON.parse(Permission);

        this.setState({
            userInfo: userInfo,
            showUserProfile: Permission.find(function (i) {return i.PermissionKey == userProfileKey}),
            showCompanyProfile: Permission.find(function (i) {return i.PermissionKey == companyProfileKey}),
        })
    }

    componentDidMount () {
        window.addEventListener("click", this._outsideClickCheck);
        LoginStore.addChangeListener(this._onChange);
        this._onChange();
    }

    componentWillUnmount () {
        window.removeEventListener("click", this._outsideClickCheck);
        LoginStore.removeChangeListener(this._onChange);
    }

    render () {
        var self = this;
        var stateObj = this.state;

        var redirectTo = stateObj.redirectTo;

        if (redirectTo) {
            return <Redirect to={redirectTo} push />;
        }

        var props = this.props;

        var userInfo = stateObj.userInfo;
        var userName = null;

        if (userInfo) {
            userName = userInfo.FirstName;
            if (!userName) {
                userName = userInfo.UserName;
            } else {
                userName = userName + " " + userInfo.LastName || "";
            }
        }

        var pointerStyle = {
            borderColor: 'transparent',
            borderBottomColor: '#fff',
            borderStyle: 'dashed dashed solid',
            borderWidth: '0 8.5px 8.5px',
            position: 'absolute',
            right: '6.5px',
            top: '-6px',
            zIndex: '1',
            height: '0',
            width: '0'
        }

        return (
            <div ref="container" style={{position: 'absolute', top: '0px', right: '0px'}}>

                {stateObj.popUp ?
                    <div
                        style={{
                            position: 'fixed',
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0,0,0,.5)',
                            zIndex: '9999',
                            left: '0px',
                            top: '0px'
                        }}>
                        <div 
                            id="user-outlet-popup"
                            style={{
                                display: 'block',
                                margin: '15px auto 0px',
                                width: '1040px',
                                maxWidth: '80%',
                                maxHeight: 'calc(100% - 30px)',
                                overflow: 'auto',
                                top: '0px',
                                left: '0px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                padding: '20px' // To hold the close button
                            }}>
                            <div onClick={this._closePopUp} style={{position: 'absolute', right: '30px', top: '10px', color: '#fff', fontSize: '30px', fontWeight: 'bold', cursor: 'pointer'}}>
                                &times;
                            </div>
                            <iframe src={stateObj.popUp} onLoad={this._onIframeLoad} style={{width: '100%', border: 'none', minHeight: '300px'}} />
                        </div>
                    </div> : null}

                <a onClick={this._showInfoContainer} className="pull-right" href="javascript: void(0);" style={{height: '50px'}}>
                    <div 
                        id="switch" 
                        style={{
                            height: '50px', 
                            float: 'right',
                            right: '0px',
                            width: '45px',
                            background: 'transparent url("images/cog-icon.png") no-repeat scroll center center'
                        }}
                        />
                </a>
                {userInfo && stateObj.expandInfo ?
                    <div
                        style={{
                            position: 'absolute',
                            width: '300px',
                            right: '5px',
                            boxShadow: '0px 1px 10px 0px rgba(0,0,0,.2)',
                            top: '45px',
                            padding: '12px 6px 6px',
                            backgroundColor: 'white',
                            zIndex: '21',
                            borderRadius:'3px'
                        }}
                        >
                        <div style={pointerStyle}></div>
                        <div style={{display: 'table', borderBottom: '1px solid #bbb', paddingBottom: '50px'}}>
                            <div style={{float: 'left', width: '105px'}}>
                                <img style={{height:'90px',width:'90px'}} src="./images/person.png" />
                            </div>

                            <div style={{float: 'left', width: '183px', paddingLeft: '8px'}}>
                                <div>{userName}</div>
                                <div style={{fontSize: '12px'}}>{userInfo.Email}</div>
                                {stateObj.showUserProfile ?
                                    <div style={{margin: '6px 0px'}}>
                                        <button className="btn btn-xs btn-primary" onClick={this._showUserProfile}>User Profile</button>
                                    </div> : null}
                                {stateObj.showCompanyProfile ?
                                    <div style={{margin: '6px 0px'}}>
                                        <button className="btn btn-xs btn-default" onClick={this._showCompanyProfile}>Company Profile</button>
                                    </div> : null}
                            </div>
                        </div>
                        
                        <div style={{display: 'inline-block', width: '100%', paddingTop: '9px'}}>
                            <a href="/Home/Login" style={{color: 'black', textDecoration: 'none'}}>
                                <button className="btn btn-sm pull-right">Sign Out</button>
                            </a>
                            <a 
                                onClick={() => {
                                    this.setState({
                                        redirectTo: {
                                            search: "",
                                            pathname: '/ChangePassword' 
                                        }
                                    }, () => {
                                        this.setState({
                                            redirectTo: null
                                        })
                                    })
                                }} 
                                style={{color: 'black', textDecoration: 'none'}}
                                >
                                <button style={{marginRight:'5px'}}className="btn btn-sm pull-right">Change Password</button>
                            </a>
                        </div>
                    </div> : null
                }
            </div>
        );
    }
}