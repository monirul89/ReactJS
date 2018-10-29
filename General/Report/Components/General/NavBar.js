import React, {Component} from 'react';

export default class NavBar extends Component {
	_resizeHandler (e) {
		var mobileMode = false;
		if (window.innerWidth < 760) mobileMode = true;
		if (this.state.mobileMode != mobileMode) {
            this._menuHidden = true;
			if (!mobileMode) {
                this.refs['menu-list'].style.removeProperty("height");
                this.refs['menu-list'].style.overflow = 'visible';
			} else {
				this.refs['menu-list'].style.overflow = 'hidden';
                this.refs['menu-list'].style.height = "0px";
			}
			this.setState({mobileMode: mobileMode});
		}
	}

	_generateCSS () {
        var styleElem = document.head.querySelector("[data-component-name=NavBar]");
        if (styleElem) return;

        var initColor = this.props.initColor || {};

        var cssCode = `
              .premise-navbar-parent * {
                box-sizing: border-box;${this.__utility.getStyleCss(this.state.options.generalStyle)}
              }
              .premise-item-title {
                color: rgb(221, 221, 221); 
              }
              .premise-dropdown-menu {
                position: absolute;
                top: 100%;
                left: 0;
                z-index: 1000;
                display: none;
                float: left;
                min-width: 160px;
                padding: 5px 0;
                margin: -0px 0 0;
                font-size: 14px;
                text-align: left;
                list-style: none;
                background-color: ${initColor.backgroundColor || "#146652"};
                -webkit-background-clip: padding-box;
                background-clip: padding-box;
                border: 1px solid #ccc;
                border: 1px solid rgba(0,0,0,.15);
                border-radius: 4px;
                -webkit-box-shadow: 0 6px 12px rgba(0,0,0,.175);
                box-shadow: 0 6px 12px rgba(0,0,0,.175);
              }
              .premise-dropdown-menu-right {
                position: absolute;
                top: 0px;
                left: calc(100% - 2px);
                z-index: 1000;
                display: none;
                float: left;
                min-width: 160px;
                padding: 5px 0;
                margin: -0px 0 0;
                font-size: 14px;
                text-align: left;
                list-style: none;
                background-color: #146652;
                -webkit-background-clip: padding-box;
                background-clip: padding-box;
                border: 1px solid #ccc;
                border: 1px solid rgba(0,0,0,.15);
                border-radius: 4px;
                -webkit-box-shadow: 0 6px 12px rgba(0,0,0,.175);
                box-shadow: 0 6px 12px rgba(0,0,0,.175);
              }
              .premise-dropdown-menu-item {
                padding: 0px 25px 0px 10px;
                display: inline-block;
                float: left;
                width: 100%;
                white-space: nowrap;
                position: relative;
                clear: both;
              }
              .premise-dropdown-menu-item:hover, .master-menu-item:hover {
                background-color: ${initColor.hoveredItemBackgroundColor || initColor.selectedItemBackgroundColor || "#004D39"};
              }
              .master-menu-item {
                display: inline-block; 
                padding: 7px 10px; 
                height: 50px; 
                line-height: 34px; 
                vertical-align: middle; 
                float: left;
                position: relative;
              }
              .master-menu-item:hover {
                border-bottom: 5px solid ${initColor.selectedItemBorderBottomColor || "#3f8456"};
              }
              .premise-caret {
                display: inline-block;
                width: 0;
                height: 0;
                margin-left: 2px;
                vertical-align: middle;
                border-top: 4px dashed;
                border-top: 4px solid\9;
                border-right: 4px solid transparent;
                border-left: 4px solid transparent;
                color: rgb(233, 252, 241);
              }
              .premise-caret-right {
                display: inline-block;
                width: 0;
                height: 100%;
                margin-left: 2px;
                vertical-align: middle;
                border-top: 4px dashed;
                border-top: 4px solid\9;
                border-right: 4px solid transparent;
                border-left: 4px solid transparent;
                color: rgb(233, 252, 241);
                position: absolute;
                right: 0px;
                transform: rotate(270deg);
              }
              
              .premise-dropdown:hover > .premise-dropdown-menu, .premise-dropdown-menu-item:hover > .premise-dropdown-menu-right  {
                display: block;
              }

              .premise-active-item {
                background-color: ${initColor.selectedItemBackgroundColor || "#004D39"};
              }
              .premise-active-item:not(.premise-dropdown-menu-item) {
                border-bottom: 5px solid ${initColor.selectedItemBorderBottomColor || "#3f8456"};
              }

              .premise-active-item > a:first-child > span.premise-item-title {
                color: rgb(251, 253, 218);
              }

              .premise-toggle {
              	position: relative;
			    float: right;
			    padding: 7px 10px;
			    margin: 8px 0px 8px 15px;
			    background-color: transparent;
			    background-image: none;
			    border: 1px solid rgb(178, 188, 187);
			    border-radius: 4px;
              }

              .premise-icon-bar {
              	background-color: #888;
              	display: inline-block;
              	width: 21px;
              	height: 2px;
              	float: left;
              	clear: both;
              	margin: 2px;
              }

              .premise-navbar-left {
              	float: left;
              }

              .mobile-mode {
              	width: 100%;
              }

            `;

        var newStyleElem = document.createElement('style');
        newStyleElem.dataset.componentName = "NavBar";
        newStyleElem.innerHTML = cssCode;
        document.head.appendChild(newStyleElem);
    }

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

        window.addEventListener('resize', this._resizeHandler);
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
		window.removeEventListener('resize', this._resizeHandler);
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

		var createItem = function (prevIndex, item, index) {
            var generatedList = [];
            if (!Array.isArray(item.list)) item.list = [];
            var accumulatedIndex = prevIndex + 1;
            item.list.map(function(subItem, subIndex) {
                generatedList.push(createItem.call(null, accumulatedIndex, subItem, subIndex));
            })

            var menuContainerClass = '';
            if (item.list && item.list.length) menuContainerClass = 'premise-dropdown ';
            menuContainerClass += item.__firstGen !== true ? 'premise-dropdown-menu-item' : 'master-menu-item';
            if (item.containerClassName) menuContainerClass += " " + item.containerClassName;
            var itemValue = item.value;
            if (activeItemValue.indexOf(itemValue) != -1) menuContainerClass += " premise-active-item";
            if (mobileMode) menuContainerClass += " mobile-mode" 

            var anchorClass = "premise-item";
            if (item.anchorClassName) anchorClass += " " + item.anchorClassName;

            var href = "javascript: void(0);"
            if (item.href) href = item.href;

            var target = "_self";
            if (item.target) target = item.target;

            var imageComponent = null;
            if (item.img) imageComponent = (<img src={item.img.src} style={item.img.style || {}} />);

            if (item.onClick) {
                item.onClick = item.onClick.bind(null, item);
            }

            if (item.onAnchorClick) {
            	item.onAnchorClick = item.onAnchorClick.bind(null, item);
            }

            return (
                <div key={index} className={menuContainerClass} onClick={item.onClick}>
					<a onClick={item.onAnchorClick} href={href} target={target} style={{display: 'flex', paddingRight: '5px', color: 'rgb(221, 221, 221)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none', float: 'left'}} className={anchorClass}>
						{imageComponent}
						<span className="premise-item-title">{item.itemName}</span>
					</a>
					{item.list.length ? 
						<div style={{float: 'left'}}>
							<span className={accumulatedIndex > 1 ? "premise-caret-right" : "premise-caret"}></span>
							
						</div> : null
					}
					{item.list.length ? 
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

            elementCenterContainerStyle.display = "block";
            elementCenterContainerStyle.width = "100%";
            elementCenterContainerStyle.position = "absolute";
            elementCenterContainerStyle.top = "50px";
            elementCenterContainerStyle.zIndex = 2;

            elementLeftContainerStyle = {
                display: 'block',
                top: '50px',
                width: "100%",
                position: 'absolute',
                transition: 'height .3s linear',
                backgroundColor: initColor.backgroundColor || '#146652',
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
					display: 'block',
					boxSizing: 'border-box',
					height: '50px',
					backgroundColor: initColor.backgroundColor || '#146652',
					borderBottom: '3px solid ' + (initColor.borderBottomColor || "green"),
					boxShadow: '0px 2px 8px rgb(84, 99, 84)',
					position: 'relative',
					zIndex: 3,
                    marginBottom: mobileMode && elementCenter ? "50px" : "0px"
				}}>
				{mobileMode ? 
					<div className="premise-navbar-left" style={{marginRight: '0px'}}>
	      				<button type="button" className="premise-toggle" onClick={this._toggleMenu}>
					        <span className="premise-icon-bar"></span>
					        <span className="premise-icon-bar"></span>
					        <span className="premise-icon-bar"></span>
					    </button>
				    </div> : null}

				<div ref="menu-list" style={elementLeftContainerStyle}>
					{data.map(createItem.bind(null, 0))}
				</div>
				<div style={elementCenterContainerStyle}>
					{elementCenter}
				</div>
				<div style={elementRightContainerStyle}>
					{elementRight}
				</div>

			</div>
	    );
	}
}