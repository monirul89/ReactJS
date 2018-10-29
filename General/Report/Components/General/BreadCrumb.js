import React, {Component} from 'react';

export default class BreadCrumb extends Component {
	
	_generateCSS () {
        var styleElem = document.head.querySelector("[data-component-name=BreadCrumb]");
        if (styleElem) return;

        var options = this.props.options || {};

        var cssCode = `
            .premise-breadcrumb-parent * {
                box-sizing: border-box;${this.__utility.getStyleCss(options.generalStyle)}
            }
            .premise-breadcrumb {
                padding: 8px 15px 12px;
                list-style: none;
                background-color: #f5f5f5;
                border-radius: 4px;
                margin: 0px;
                line-height: 1;
                box-shadow: rgba(84, 99, 84, 0.22) 0px 3px 8px;
            }
            .premise-breadcrumb > li + li:before {
                padding: 0 5px;
                color: #ccc;
                content: "/";
            }
            .premise-breadcrumb > li {
                display: inline-block;
            }
            .premise-anchor {
                color: rgb(51, 122, 183);
            }
            .premise-breadcrumb-active {
                color: #777;
            }
        `;

        var newStyleElem = document.createElement('style');
        newStyleElem.dataset.componentName = "BreadCrumb";
        newStyleElem.innerHTML = cssCode;
        document.head.appendChild(newStyleElem);
    }

    componentWillReceiveProps (nextProps) {
        var nextOptions = nextProps.options || {};
        var curOptions = this.props.options || {};
        if (nextOptions.generalStyle != curOptions.generalStyle) {
            var cssRules = document.head.querySelector("[data-component-name=BreadCrumb]").sheet.cssRules[0];
            cssRules.style.cssText = "box-sizing:border-box;" + this.__utility.getStyleCss(nextOptions.generalStyle);
        }
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


        this._generateCSS();
	}

	render () {
		var self = this;
		var stateObj = this.state;
        var props = this.props;
        var data = props.data;
        var options = props.options;

        var dataLen = data.length;

		var createItem = function (item, index) {

            var className = item.className || "";
            if (index == dataLen - 1) {
                if (className == "") className = "premise-breadcrumb-active";
                else className += " premise-breadcrumb-active";
            } else {
                if (className == "") className = "premise-anchor";
                else className += " premise-anchor";
            }

            var imageComponent = null;
            if (item.img) imageComponent = (<img src={item.img.src} style={item.img.style || {}} />);

            if (item.onClick) {
                item.onClick = item.onClick.bind(null, item);
            }

            if (item.onAnchorClick) {
                item.onAnchorClick = item.onAnchorClick.bind(null, item);
            }
           
            return (
                <li key={index} style={{verticalAlign: 'middle', lineHeight: '18px'}} onClick={item.onClick}>
                    {imageComponent}
                    <a onClick={item.onAnchorClick || null} href={item.href || "javascript: void(0);"} target={item.target || "_self"} className={className}>{item.itemName}</a>
                </li>
            )
  
        }

        var rootStyle = {marginTop: '6px', display: 'block', width: '100%'};
        if (props.style) rootStyle = Object.assign(rootStyle, props.style);

		return (
            <div className="premise-breadcrumb-parent" style={rootStyle}>
    			<ol className="premise-breadcrumb">
                    {data.map(createItem)}
                </ol>
            </div>
	    );
	}
}