import React from 'react';

// import Scroller from './Scroller';
import commonFunctions from '../../Utils/commonFunctions';

export default class Modal extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            open: props.open,
            children: props.children
        }

        this.denyUpdate = false;
        this._resizeHandler = this._resizeHandler.bind(this);
    }

    shouldComponentUpdate (nextProps) {
        if (this.denyUpdate === true) {
            this.denyUpdate = false;
            return false;
        } else return true;
    }

    componentWillReceiveProps (nextProps) {
        var open = nextProps.open;
        var nextState = {
            open: open
        };

        if (open) {
            nextState.children = nextProps.children;
        }

        if (open == this.state.open) {
            this.denyUpdate = true;
        }
        
        this.setState(nextState);
    }

    _resizeHandler (e) {
        this.forceUpdate();
    }

    componentDidMount () {
        commonFunctions.addListener('resize', this._resizeHandler);
    }

    componentWillUnmount () {
        commonFunctions.removeListener('resize', this._resizeHandler);
    }

    componentDidUpdate (prevProps, prevState) {
        var self = this;
        var props = this.props;
        var openState = props.open;
        if (openState && !prevProps.open) {
            this.refs['container'].focus();
        }
    }

    componentWillUpdate (nextProps, nextState) {
        
    }

    render () {
        var self = this;
        var stateObj = this.state;
        var props = this.props;

        var openState = stateObj.open;

        var containerStyle = {
            position: 'fixed',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: '99',
            transition: "transform .3s ease-in-out, opacity .2s ease-in-out",
            zIndex: '4',
            top: '0px',
            left: '0px',
            transform: openState === true ? "scale(1, 1)" : "scale(0, 0)",
            opacity: openState === true ? '1' : '0'
        }

        if (props.rootStyle) {
            Object.assign(containerStyle, props.rootStyle);
        }

        var innerContainerStyle = {
            boxShadow: '0 5px 15px rgba(0,0,0,.5)',
            position: 'relative', 
            zIndex: '5', 
            //width: "600px", 
            //maxWidth: '90%',
            //maxHeight: "calc(100% - 40px)", 
            margin: 'auto', 
            display: 'table',
            justifyContent: 'center', 
            backgroundColor: 'white',
            borderRadius: '2px',
            border: '1px solid white',
            marginTop: '20px',
            minHeight: '250px'
        }

        if (props.innerContainerStyle) {
            delete innerContainerStyle.width;
            delete innerContainerStyle.height;
            delete innerContainerStyle.minWidth;
            delete innerContainerStyle.maxWidth;
            Object.assign(innerContainerStyle, props.innerContainerStyle);
        }

        if (innerContainerStyle.width) innerContainerStyle.display = 'block';

        var styleObj = {
            maxHeight: (window.innerHeight - 40) + "px",
            maxWidth: (window.innerWidth - 80) + "px",
            overflow: 'auto'
        }

        if (props.style) {
            Object.assign(styleObj, props.style);
        }

        // if (!openState) {
        //     var masterNode = this.refs['master-node'];
        //     if (masterNode) styleObj.height = masterNode.offsetHeight + "px";
        // }

        return (
            <div
                className="col-sm-12" 
                ref="container" 
                onKeyUp={(e) => {
                    if (e.which == 27 && self.props.onHideRequest) {
                        self.props.onHideRequest();
                    }
                }} 
                tabIndex="-1" 
                style={containerStyle} 
                onClick={(e) => {
                    if (e.target == e.currentTarget && self.props.onHideRequest) {
                        self.props.onHideRequest();
                    }
                }}
                >    
                <div style={innerContainerStyle}>
                    <div ref="master-node" style={styleObj} id={props.id || null}>
                        {stateObj.children}
                    </div>
                </div>
            </div>
        );
    }
}


/*
<Scroller>
    <ContextMenu 
        ref="mod-item-cm"
        items={[]}
        style={{}}
    />
    {props.children}

</Scroller>

*/
