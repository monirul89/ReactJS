import React, { Component } from 'react';
import CommonApi from '../../utils/ServerApi/CommonApi';
import moment from 'moment';
import PropTypes from 'prop-types';
import CommonStore from '../../stores/Common.store';
import AppOtherConst from '../../constants/AppOthersConstant';
import _ from 'underscore';
class CommentList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Data: []
        };
        this.loadData = this.loadData.bind(this);
    }
    componentDidMount() {
        this.loadData();       
    }
    loadData(){
        let self = this;
        const url = AppOtherConst.API_PREMISE_DOMAIN + "/api/CapitalExpence/GetDiscussionAttachment?AppKey=" + CommonStore.getAppKey() + "&Key=" + CommonStore.getKey() + "&MID=" + this.props.MID;
        var myMap = new Map();
        self._get(url, myMap, function (returnData) {

            if (returnData.Status == "success") {
                var data = JSON.parse(returnData.Data);
                 data = _.sortBy(data, 'Date').reverse();
                self.setState({
                    Data: data
                });
            }

        });
    }
    update(){
        this.denyUpdate == true
        this.loadData();
    }
    componentWillReceiveProps() {
        this.denyUpdate = true;
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (this.denyUpdate == true) {
            this.denyUpdate = false;
            return false;
        } else return true;
    }
    generateData() {

        let data = this.state.Data.map((m,index) => {
            return (<li key={"Comment"+index} className="left clearfix">
                <span className="chat-img pull-left">
                    <div className='comment-profile-pic'>{m.UserName[0]}</div>
                </span>
                <div className="chat-body clearfix">
                    <div className="header">
                        <span className="primary-font">{m.UserName}</span> <small className="pull-right text-muted">
                            <span className="glyphicon glyphicon-time"></span>{moment.utc(m.InsertedDate, "YYYY-MM-DD hh:mm:ss A").local().fromNow()}</small>
                    </div>
                    <p>
                        {m.Body}
                        {(m.Attachments.length > 0 && <span style={{marginTop: '5px', fontSize: '11px', fontStyle: 'italic', display:'inherit'}}>Attachment:</span>)}
                        {                         
                            m.Attachments.map((p,index)=>{
                                return <span style={{display:'inherit'}} key={index}>{p.AttachmentName+" "} <a download="w3logo" href={p.AttachmentFile}><i className="fa fa-download" aria-hidden="true"></i></a></span>
                            })
                        }
                    </p>
                </div>
            </li>)
        })
        return data;
    }
    render() {
        return (
            <ul className="chat">
                {this.state.Data.length == 0 ? <p>No comments found</p> : this.generateData()}
            </ul>

        );
    }
}
export default CommentList;