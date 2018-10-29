import React, { Component } from 'react';


import NavMenuStore from '../stores/TopMenu.store.js';

import LoginStore from '../stores/User.store.js';

import UserOutlet from './UserOutlet';

import BreadCrumb from './General/BreadCrumb';
import NavBar from './General/NavBar';

import {getSearchPairs, getSearchStr} from '../utils/CommonUtils.js';

var breadCrumbData = [];

var prevHashItems = [];
var prevId = null;

export default class Navigator extends Component {
    constructor (props) {
        super(props);
        //var searchCredentials = AppStateStore.getSearchCredentials();
        //var searchCredentials = {};
        var searchCredentials = getSearchPairs();

        this._styleChangeHandler = this._styleChangeHandler.bind(this);
        this._handleNavigation = this._handleNavigation.bind(this);

        breadCrumbData = [/*{
         className: 'home-images rr-home',
         itemName: "",
         href: "/Home/Login"
         },*/ {
            itemName: "Apps",
            href: '/UserInfo/Apps/MyApps' + (searchCredentials.AppKey ? ('?AppKey=' + searchCredentials.AppKey + '&Key=' + searchCredentials.Key) : "")
        }, {
            itemName: "COI",
            link: ''
        }]

        this.__initColor = {
            // backgroundColor: '#fff',
            backgroundColor: 'rgb(0, 127, 163)',
            borderBottomColor: '#fff',
            hoveredItemBackgroundColor: '#fff',
            selectedItemBackgroundColor: '#fff',
            selectedItemBorderBottomColor: '#fff',
            // color: 'black',
            color: '#fff',
            fontSize: '13px'
        };

        this.state = {
            navMenuItems: NavMenuStore.getNavMenuItems()
            //activeMenuArr: NavMenuStore.getActiveMenuArr()
        };
    }

    /*_onChange: function () {
     this.setState({
     navMenuItems: NavMenuStore.getNavMenuItems(),
     activeMenuArr: NavMenuStore.getActiveMenuArr()
     })
     },*/

    _styleChangeHandler () {
        var styleObj = LoginStore.getLoginData();
        if (!styleObj) return;

        var initColor = this.__initColor = {
            // backgroundColor: '#fff',
            backgroundColor: 'rgb(245, 243, 243)',
            borderBottomColor: '#fff',
            hoveredItemBackgroundColor: '#fff',
            selectedItemBackgroundColor: '#fff',
            selectedItemBorderBottomColor: '#fff',
            // color: 'black',
            color: '#6b5656',
            fontSize: '13px'
        };

        LoginStore.removeChangeListener(this._styleChangeHandler);

        styleObj = JSON.parse(styleObj.Style)[0];

        var mapping = {
            'Menu_Background_Color': 'backgroundColor',
            'Menu_Hover_Background_Color': 'hoveredItemBackgroundColor',
            'Menu_Selected_Background_Color': 'selectedItemBackgroundColor',
            'Menu_Color': 'color',
            'Menu_Font_Size': 'fontSize'
        }

        Object.keys(mapping).map(function (key) {
            var c = styleObj[key];
            if (c) initColor[mapping[key]] = c;
        })

        var mapping_body = {
            'Font_Size': 'fontSize',
            'Font_Primary_Color': 'color'
        }

        var bodyStyle = document.body.style;
        Object.keys(mapping_body).map(function (key) {
            var c = styleObj[key];
            if (c) bodyStyle[mapping_body[key]] = c;
        })

        var mapping_other_gen = {
            'Background_Primary_Color': function (c) {
                return ".panel-heading,.primary-content{background-color:" + c + "}";
            },
            'Background_Secondary_Color': function (c) {
                return ".panel-body,.secondary-content{background-color:" + c + "}";
            },
            'Font_Secondary_Color': function (c) {
                return ".footer{color:" + c + "}";
            },
            'Success_Button_Font': function (c) {
                return ".button-success{color:" + c + "}";
            },
            'Delete_Button_Font': function (c) {
                return ".button-delete{color:" + c + "}";
            },
            'Default_Button_Background': function (c) {
                return ".button-default{background-color:" + c + "}";
            },
            'Table_Header': function (c) {
                return ".table-header{background-color:" + c + "}";
            },
            'Alternate_Table_Row': function (c) {
                return ".table-row-even{background-color:" + c + "}";
            },
            'Default_Button_Font': function (c) {
                return ".button-default{color:" + c + "}";
            },
            'Success_Button_Background': function (c) {
                return ".button-success{background-color:" + c + "}";
            },
            'Delete_Button_Background': function (c) {
                return ".button-delete{background-color:" + c + "}";
            },
            'Menu_Background_Color': function (c) {
                return "a{color:" + c + "}.page-active{color:" + c + "}";
            },
            'Menu_Selected_Background_Color': function (c) {
                return "a:hover{color:" + c + "}";
            },
            'Header_Font_Size': function (c) {
                return ".header-font-size{font-size:" + c + "}";
            },

            'Header_Font_Color': function (c) {
                return ".header-font-color{color:" + c + "}";
            },
            'Header_Description_Font_Size': function (c) {
                return ".header-description-font-size{font-size:" + c + "}";
            },
            'Header_Description_Font_Color': function (c) {
                return ".header-description-font-color{color:" + c + "}";
            },
            'Section_Font_Size': function (c) {
                return ".section-font-size{font-size:" + c + "}";
            },
            'Section_Font_Color': function (c) {
                return ".section-font-color{color:" + c + "}";
            }

        };

        var otherStyleHTML = "";
        Object.keys(mapping_other_gen).map(function (key) {
            var c = styleObj[key];
            if (c) otherStyleHTML += mapping_other_gen[key](c);
        })

        if (otherStyleHTML) {
            var otherStyleElem = document.createElement('style');
            otherStyleElem.id = 'customised-style';
            otherStyleElem.innerHTML = otherStyleHTML
            document.head.appendChild(otherStyleElem);
        }

        this.forceUpdate(() => {
            this.refs['NavBar']._generateCSS();
        });
    }

    componentDidMount () {
        //NavMenuStore.addChangeListener(this._onChange);
        LoginStore.addChangeListener(this._styleChangeHandler);
        window.addEventListener('popstate', this._handleNavigation);

        // $('.premise-toggle').unbind("click");
        // $(document).on('click', '.premise-toggle', function() {
        //     $('.premise-navbar-parent > div:nth-child(2)').toggleClass('active');
        // })
        // $(document).mouseup(function(e) {
        //     var container = $(".premise-navbar-parent > div:nth-child(2)");
        //     if ( container.hasClass('active')) {
        //         container.toggleClass('active');
        //     }
        // });
    }

    componentWillUnmount () {
        //NavMenuStore.removeChangeListener(this._onChange);
        LoginStore.removeChangeListener(this._styleChangeHandler);
        window.removeEventListener('popstate', this._handleNavigation);
    }

    _handleNavigation () {
        var self = this;
        var updateRequired = false;
        var hash = location.hash.substr(1) || "";
        var currentId = null;
        var hashItems = hash.split('/');

        // var hashToActionMapper = {
        //     'Contact_List':'ContactList',
        //     'Create_Contact':'CreateContact'
        // }
        // if (hash in hashToActionMapper) {
        //     var newSearchPairs = getSearchPairs();
        //     currentId = newSearchPairs.id;
        //     if (prevHashItems.toString() != hashItems.toString() && prevId == currentId) {
        //         currentId = null;
        //         delete newSearchPairs.id;
        //         delete newSearchPairs.type;
        //         //window.history.replaceState(history.state, "", "?" + getSearchStr(newSearchPairs) + window.location.hash);
        //     }
        //     CurrentViewAction.addItem(hashToActionMapper[hash], currentId || "");
        // }

        prevHashItems = hashItems;
        prevId = currentId;

        updateRequired = true;

        var newNavMenuItems = NavMenuStore.getNavMenuItems();
        if (updateRequired || JSON.stringify(this.state.navMenuItems) != JSON.stringify(newNavMenuItems)) {
            this.setState({
                navMenuItems: newNavMenuItems
            });
        }
    }

    render() {
        var self = this;
        var stateObj = this.state;

        var ext_BCD = [].concat(breadCrumbData);

        var activeItemValue = [];

        // var navMenuItems = NavMenuStore.getNavMenuItems();
        var navMenuItems = stateObj.navMenuItems;
        var activeMenuArr = NavMenuStore.getActiveMenuArr();

        if (activeMenuArr.length) {
            activeMenuArr.map(function (i) {
                ext_BCD.push({itemName: i.itemName, link: i.href});
                activeItemValue.push(i.value);
            })
        }

        if (ext_BCD.length > 3) {
            delete ext_BCD[ext_BCD.length - 1].href;
        }

        var initColor = this.__initColor;

        return (
            <div>
                {initColor ?
                    <NavBar
                        ref='NavBar'
                        data={navMenuItems}
                        elementRight={<UserOutlet />}
                        activeItemValue={activeItemValue}
                        initColor={initColor}
                    /> : null}
                {initColor ? <BreadCrumb data={ext_BCD} style={{fontWeight: 'bold', fontSize: initColor.fontSize || null}}/> : null}
            </div>
        );
    }
};
