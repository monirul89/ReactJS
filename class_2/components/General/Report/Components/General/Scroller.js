import React from "react";

export default class Scroller extends React.Component {
    constructor (props) {
        super(props);

        this._scrollHandler = this._scrollHandler.bind(this);
        this.resetSensors = this.resetSensors.bind(this);
        this._scrollDetector = this._scrollDetector.bind(this);
        this._mouseMoveHandler = this._mouseMoveHandler.bind(this);
        this._mouseUpHandler = this._mouseUpHandler.bind(this);
    }

    resetSensors () {
        var overflowContainer = this.refs['overflow-container'];
        var offsetHeight = overflowContainer.offsetHeight;
        var scrollHeight = overflowContainer.scrollHeight;

        var scrollbarOffsetHeight = offsetHeight / 4;

        if (scrollbarOffsetHeight > scrollHeight - offsetHeight) scrollbarOffsetHeight = 2 * offsetHeight - scrollHeight;

        var scrollbar = this.refs['scrollbar'];
        scrollbar.style.height = scrollbarOffsetHeight + "px";

        var {expandChild, expand, shrink} = this;

        expandChild.style.width = expand.offsetWidth + 10 + 'px';
        expandChild.style.height = expand.offsetHeight + 10 + 'px';
        expand.scrollLeft = expand.scrollWidth;
        expand.scrollTop = expand.scrollHeight;
        shrink.scrollLeft = shrink.scrollWidth;
        shrink.scrollTop = shrink.scrollHeight;

        if (offsetHeight == scrollHeight) {
            scrollbar.parentNode.parentNode.style.display = "none";
            overflowContainer.style.padding = "0px 13px 0px 0px";
            this.quotient = null;
            this.prevScrollTop = 0;
        } else {
            if (this.quotient === null) {
                scrollbar.parentNode.parentNode.style.removeProperty('display');
                overflowContainer.style.padding = "0px 30px 0px 0px";
            }
            this.quotient =  (offsetHeight - scrollbarOffsetHeight - 10) / (scrollHeight - offsetHeight);
            scrollbar.style.marginTop = overflowContainer.scrollTop * this.quotient + "px";
        }

    };

    componentDidMount () {
        this.expandChild = this.refs['expand-child'];
        this.expand = this.refs['expand'];
        this.shrink = this.refs['shrink'];

        this.resetSensors();

        window.addEventListener('mousemove', this._mouseMoveHandler);
        window.addEventListener('mouseup', this._mouseUpHandler);
    }

    _mouseMoveHandler (e) {
        if (!this.__dragScrollbar) return;
        e.preventDefault();
        if (e.clientX > this.__clickedXPos + 100 || e.clientX < this.__clickedXPos - 100) {
            this.__dragScrollbar = false;
            this.__clickedYPos = null;
            this.__clickedXPos = null;
            return;
        }

        if (e.clientY == this.__clickedYPos) return;
        var overflowContainer = this.refs['overflow-container'];
        //console.log('');
        //console.log("OffsetHeight", overflowContainer.offsetHeight);
        //console.log("ScrollHeight", overflowContainer.scrollHeight);
        //console.log("ScrollTop", overflowContainer.scrollTop);
        //console.log('Quotient', this.quotient);
        //console.log('ClickedYPos', this.__clickedYPos);
        //console.log('ClientY', e.clientY);
        //console.log('Previous ScrollTop', this.prevScrollTop);
        //console.log('ScrollTop Addition', (e.clientY - this.__clickedYPos) / this.quotient);
        //let addedScrollTop = (e.clientY - this.__clickedYPos) / this.quotient;
        //if (e.clientY > this.__clickedYPos) addedScrollTop = Math.ceil(addedScrollTop);
        //else addedScrollTop = Math.floor(addedScrollTop);
        //overflowContainer.scrollTop = overflowContainer.scrollTop + (e.clientY - this.__clickedYPos) / this.quotient;
        overflowContainer.scrollTop = this.prevScrollTop + (e.clientY - this.__clickedYPos) / this.quotient;
        //console.log('Updated ScrollTop', overflowContainer.scrollTop);
        //console.log('');
        //if (prevScrollTop != overflowContainer.scrollTop) {
        //} 
        //this.__clickedYPos = e.clientY;
    }

    _mouseUpHandler (e) {
        if (!this.__dragScrollbar) return;
        this.__dragScrollbar = false;
        this.__clickedYPos = null;
        this.__clickedXPos = null;
    }

    _scrollDetector (e) {
        this.resetSensors();
    }

    componentDidUpdate () {
        this.resetSensors();
    }

    componentWillUnmount () {
        window.removeEventListener('mousemove', this._mouseMoveHandler);
        window.removeEventListener('mouseup', this._mouseUpHandler);
    }

    _scrollHandler (e) {
        var overflowContainer = this.refs['overflow-container'];
        var scrollbar = this.refs['scrollbar'];

        scrollbar.style.marginTop = overflowContainer.scrollTop * this.quotient + "px";
    }

    render () {
        return (
            <div onScroll={this._scrollHandler} style={{position: 'relative', display: 'block', width: '100%', height: '100%', overflow: 'hidden', boxSizing: 'border-box', paddingRight: '15px'}}>
                <div 
                    style={{
                        marginRight: '-45px',
                        maxHeight: "100%", 
                        overflowY: 'scroll',
                        overflowX: 'hidden',
                        padding: '0px 30px 0px 0px',
                        boxSizing: 'content-box',
                        position: 'relative'
                    }}
                    ref="overflow-container"
                    >
                    
                    {this.props.children}

                    <div 
                        onScroll={this._scrollDetector}
                        className="resize-sensor">
                        <div className="RS-expand" ref="expand">
                            <div className="RS-expand-child" ref="expand-child"></div>
                        </div>
                        <div className="RS-shrink" ref="shrink">
                            <div className="RS-shrink-child" ref="shrink-style"></div>
                        </div>
                    </div>
                    
                </div>

                <div 
                    onClick={function (e) {
                        if (e.clientY > this.refs['scrollbar'].getBoundingClientRect().top) this.refs['overflow-container'].scrollTop += 200;
                        else this.refs['overflow-container'].scrollTop -= 200;
                    }.bind(this)}
                    style={{position: 'absolute', userSelect: 'none', right: '3px', top: '0px', height: 'calc(100% - 9px)', margin: '5px 0px'}}>
                    <div style={{height: '100%', float: 'right', backgroundColor: 'rgba(127, 122, 151, 0.17)', borderRadius: '20px', width: '7px'}}>
                        <div 
                            onClick={(e) => {e.stopPropagation();}}
                            onMouseDown={function (e) {
                                this.__dragScrollbar = true;
                                this.__clickedYPos = e.clientY;
                                this.__clickedXPos = e.clientX;
                                this.prevScrollTop = this.refs['overflow-container'].scrollTop;
                                e.stopPropagation();
                                e.preventDefault();
                            }.bind(this)}
                            
                            ref="scrollbar" style={{display: 'inline-block', transition: 'margin-top .1s linear', height: '0px', backgroundColor: 'rgba(0, 0, 0, .28)', width: '7px', borderRadius: '4px'}}>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}