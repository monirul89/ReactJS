import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class NavBar extends Component {
    constructor (props) {
        super(props);

        this.__utility = {
            getStyleCss: function (data) {
                var returnData = "";
                if (data) {
                    if (typeof data == "function") {
                        returnData = data() || "";
                    } else if (typeof data == "string") {
                        returnData = data;
                    }
                }
                return returnData;
            }
        }

        this.__componentRendered = false;

        var data = props.data;
        data.map(function (item) {
            item.__firstGen = true;
        })

        var mobileMode = window.innerWidth < 760

        var activeItemValue = props.activeItemValue;
        if (!Array.isArray(activeItemValue)) activeItemValue = [activeItemValue];

        this.state = {
            data: props.data,
            options: props.options || {},
            elementRight: props.elementRight,
            elementCenter: props.elementCenter,
            activeItemValue: activeItemValue,
            mobileMode: mobileMode
        }

        this._generateCSS();
        this._resizeHandler = this._resizeHandler.bind(this);
        this._toggleMenu = this._toggleMenu.bind(this);
    }

    _resizeHandler (e) {
        var mobileMode = false;
        if (window.innerWidth < 760) mobileMode = true;
        if (this.state.mobileMode != mobileMode) {
            this._menuHidden = true;
            var menuList = this.refs['menu-list'];
            if (!mobileMode) {
                menuList.style.removeProperty("height");
                menuList.style.overflow = 'visible';
            } else {
                menuList.style.overflow = 'hidden';
                menuList.style.height = "0px";
            }
            this.setState({ mobileMode: mobileMode });
        }
    }

    _generateCSS () {
        var styleElem = document.head.querySelector("[data-component-name=NavBar]");
        if (styleElem) {
            styleElem.remove();
        }

        var initColor = this.props.initColor || {};

        var cssCode = (initColor.fontSize ? ".premise-navbar-parent{font-size:" + initColor.fontSize + "}" : "") + '.premise-dropdown-menu,.premise-dropdown-menu-right{position:absolute;z-index:1000;display:none;min-width:160px;padding:5px 0;margin:-2px 0px 0px;/*font-size:14px;*/text-align:left;list-style:none;float:left}.premise-navbar-parent *{box-sizing:border-box}.premise-item-title{color:' + (initColor.color || "#ddd") + '}.premise-dropdown-menu{top:100%;left:0;background-color:' + (initColor.backgroundColor || "#146652") + ';-webkit-background-clip:padding-box;background-clip:padding-box;border:1px solid #ccc;border:1px solid rgba(0,0,0,.15);border-radius:4px;-webkit-box-shadow:0 6px 12px rgba(0,0,0,.175);box-shadow:0 6px 12px rgba(0,0,0,.175)}.premise-dropdown-menu-right{top:0;left:calc(100% - 2px);background-color:#146652;-webkit-background-clip:padding-box;background-clip:padding-box;border:1px solid #ccc;border:1px solid rgba(0,0,0,.15);border-radius:4px;-webkit-box-shadow:0 6px 12px rgba(0,0,0,.175);box-shadow:0 6px 12px rgba(0,0,0,.175)}.premise-dropdown-menu-item{padding:0 25px 0 10px;display:inline-block;float:left;width:100%;white-space:nowrap;position:relative;clear:both}.premise-caret,.premise-caret-right{display:inline-block;width:0;margin-left:2px;vertical-align:middle;border-right:4px solid transparent;border-left:4px solid transparent;color:#e9fcf1}.premise-dropdown-menu-item:hover,.master-menu-item:hover{background-color:' + (initColor.hoveredItemBackgroundColor || initColor.selectedItemBackgroundColor || "#004D39") + '}.master-menu-item{display:inline-block;padding:7px 10px;height:50px;line-height:38px;vertical-align:middle;float:left;position:relative;background-color:' + (initColor.backgroundColor || 'rgb(20, 102, 82)') + ';/*border-bottom:3px solid ' + (initColor.borderBottomColor || 'green') + '*/}.master-menu-item:hover{/*border-bottom:5px solid ' + (initColor.selectedItemBorderBottomColor || initColor.borderBottomColor || "green") + '*/}.premise-caret{height:0;border-top:4px dashed;border-top:4px solid\9}.premise-caret-right{height:100%;border-top:4px dashed;border-top:4px solid\9;position:absolute;right:0;transform:rotate(270deg)}.premise-dropdown-menu-item:hover>.premise-dropdown-menu-right,.premise-dropdown:hover>.premise-dropdown-menu{display:block}.premise-active-item{background-color:' + (initColor.selectedItemBackgroundColor || "#004D39") + '}.premise-active-item:not(.premise-dropdown-menu-item){/*border-bottom:5px solid ' + (initColor.selectedItemBorderBottomColor || "#3f8456") + '*/}/*.premise-active-item>a:first-child>span.premise-item-title{color:#fbfdda}*/.premise-toggle{position:relative;float:right;padding:7px 10px;margin:8px 0 8px 15px;background-color:transparent;background-image:none;border:1px solid #b2bcbb;border-radius:4px}.premise-icon-bar{background-color:#888;display:inline-block;width:21px;height:2px;float:left;clear:both;margin:2px}.premise-navbar-left{float:left}.mobile-mode{width:100%}';

        var newStyleElem = document.createElement('style');
        newStyleElem.dataset.componentName = "NavBar";
        newStyleElem.innerHTML = cssCode;
        document.head.appendChild(newStyleElem);
    }

    componentWillReceiveProps (nextProps) {
        nextProps.data.map(function (item) {
            item.__firstGen = true;
        })

        var activeItemValue = nextProps.activeItemValue;
        if (!Array.isArray(activeItemValue)) activeItemValue = [activeItemValue];

        this.setState({
            data: nextProps.data,
            elementRight: nextProps.elementRight,
            elementCenter: nextProps.elementCenter,
            activeItemValue: activeItemValue
        })

        var nextOptions = nextProps.options || {};
        var curOptions = this.props.options || {};

        if (nextOptions.generalStyle != curOptions.generalStyle) {
            var cssRules = document.head.querySelector("[data-component-name=NavBar]").sheet.cssRules[0];
            cssRules.style.cssText = "box-sizing:border-box;" + this.__utility.getStyleCss(nextOptions.generalStyle);
        }
    }

    componentDidMount () {
        this._toggleMenu();
    }

    componentWillUnmount () {
    }

    _toggleMenu (e) {
        var self = this;
        if (this.state.mobileMode) {
            var inputObj = this.refs['menu-list'];
            if (this._menuHidden) {
                inputObj.style.height = ((this.state.data.length) * 50) + "px";
                setTimeout(function () {
                    self._menuHidden = false;
                    inputObj.style.overflow = "visible";
                }, 300);
            } else {
                inputObj.style.height = "0px";
                inputObj.style.overflow = "hidden";
                setTimeout(function () {
                    self._menuHidden = true;
                }, 300);
            }
        }
    }

    render () {
        var self = this;
        var stateObj = this.state;
        var mobileMode = stateObj.mobileMode;

        var data = stateObj.data;
        var elementCenter = stateObj.elementCenter;
        var elementRight = stateObj.elementRight;
        var initColor = this.props.initColor || {};

        var activeItemValue = stateObj.activeItemValue;

        var componentDataContainer = {};

        var menuHidden = this._menuHidden;

        var createItem = function (prevIndex, item, index) {
            var generatedList = [], list = item.list;
            if (!Array.isArray(list)) list = [];
            var listLen = 0, accumulatedIndex = prevIndex + 1;
            list.map(function (subItem, subIndex) {
                if (subItem.hidden !== true) listLen++;
                generatedList.push(createItem.call(null, accumulatedIndex, subItem, subIndex));
            })

            var menuContainerClass = '';
            if (listLen) menuContainerClass = 'premise-dropdown ';
            menuContainerClass += item.__firstGen !== true ? 'premise-dropdown-menu-item' : 'master-menu-item';
            if (item.containerClassName) menuContainerClass += " " + item.containerClassName;
            var itemValue = item.value;
            if (activeItemValue.indexOf(itemValue) != -1) menuContainerClass += " premise-active-item";
            if (mobileMode) menuContainerClass += " mobile-mode"

            var anchorClass = "premise-item";
            if (item.anchorClassName) anchorClass += " " + item.anchorClassName;

            var useLinkComp = false;
            var href = "javascript: void(0);"
            if (!listLen || ((prevIndex || !mobileMode) && item.href)) {
                href = item.href;
                if (item.hash) {
                    href = '/' + href;
                    useLinkComp = true;
                } 
            }


            var target = "_self";
            if (item.target) target = item.target;

            var imageComponent = null;
            if (item.img) imageComponent = (<img src={item.img.src} style={item.img.style || {}} />);

            var onAnchorClick = item.onAnchorClick || (listLen ? null : self._toggleMenu);

            return (
                <div key={index} className={menuContainerClass} >
                    {/*<Link
                        to={"/" + href}
                        //target={target}
                        style={{ display: 'flex', paddingRight: '5px', color: 'rgb(221, 221, 221)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none', float: 'left' }}
                        className={anchorClass}
                        >
                        {imageComponent}
                        <span className="premise-item-title">{item.itemName}</span>
                    </Link>*/}
                    
                    {item.hidden !== true ?

                        (useLinkComp ?
                            <Link
                                to={{
                                    pathname: href,
                                    search: ''
                                }}
                                onClick={onAnchorClick} 
                                // target={target} 
                                style={{
                                    display: 'flex', 
                                    paddingRight: '5px', 
                                    color: 'rgb(221, 221, 221)', 
                                    cursor: 'pointer', 
                                    // fontWeight: 'bold', 
                                    textDecoration: 'none', 
                                    float: 'left'
                                }} 
                                className={anchorClass}
                                >
                                {imageComponent}
                                <span className="premise-item-title">{item.itemName}</span>
                            </Link>
                                :
                            <a 
                                onClick={onAnchorClick} 
                                href={href} 
                                target={target} 
                                style={{
                                    display: 'flex', 
                                    paddingRight: '5px', 
                                    color: 'rgb(221, 221, 221)', 
                                    cursor: 'pointer', 
                                    fontWeight: 'bold', 
                                    textDecoration: 'none', 
                                    float: 'left'
                                }} 
                                className={anchorClass}
                                >
                                {imageComponent}
                                <span className="premise-item-title">{item.itemName}</span>
                            </a>
                        )
                            :
                        null
                    }


                    {listLen ?
                        <div style={{ float: 'left' }}>
                            <span className={accumulatedIndex > 1 ? "premise-caret-right" : "premise-caret"}></span>

                        </div> : null
                    }
                    {listLen ?
                        <div className={accumulatedIndex > 1 ? "premise-dropdown-menu-right" : "premise-dropdown-menu"}>
                            {generatedList}
                        </div> : null
                    }

                </div>
            )

        }

        var elementRightContainerStyle = {};
        var elementCenterContainerStyle = {};
        var elementLeftContainerStyle = {};
        if (mobileMode) {
            elementRightContainerStyle.position = "absolute";
            elementRightContainerStyle.top = "0px";
            elementRightContainerStyle.right = "0px";

            elementCenterContainerStyle = {
                display: "inline-block",
                width: "100%",
                zIndex: "2",
                marginBottom: '-3px',
                paddingBottom: '5px',
                borderTop: '1px solid #ccc'
            }

            elementLeftContainerStyle = {
                display: 'block',
                top: '50px',
                width: "100%",
                position: 'absolute',
                transition: 'height .3s linear',
                zIndex: 3
            }
        } else {
            elementRightContainerStyle.float = "right";

            elementCenterContainerStyle.display = "inline-block";
            elementCenterContainerStyle.float = "left";

            elementLeftContainerStyle = {
                display: 'inline-block',
                float: 'left',
                clear: 'both',
                width: "auto"
            }

        }

        return (
            <div
                ref="primary-menu"
                className="premise-navbar-parent"
                style={{
                    float: 'left',
                    width: '100%',
                    boxSizing: 'border-box',
                    minHeight: '50px',
                    backgroundColor: initColor.backgroundColor || '#146652',
                    //borderBottom: '3px solid ' + (initColor.borderBottomColor || "green"),
                   // boxShadow: 'rgb(146, 158, 146) 0px 1px 8px',
                    position: 'relative',
                    zIndex: 3,
                    //marginBottom: mobileMode && elementCenter ? "50px" : "0px"
                }}>
                {mobileMode ?
                    <div className="premise-navbar-left" style={{ marginRight: '0px' }}>
                        <button type="button" className="premise-toggle" onClick={this._toggleMenu}>
                            <span className="premise-icon-bar"></span>
                            <span className="premise-icon-bar"></span>
                            <span className="premise-icon-bar"></span>
                        </button>
                    </div> : null}

                <div ref="menu-list" style={elementLeftContainerStyle}>
                    {data.map(createItem.bind(null, 0))}
                </div>
                {elementCenter ?
                    <div style={elementCenterContainerStyle}>
                        {elementCenter}
                    </div> : null}
                {elementRight ?
                    <div style={elementRightContainerStyle}>
                        {elementRight}
                    </div> : null}

            </div>
        );
    }
};