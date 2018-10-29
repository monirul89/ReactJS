import React, { Component } from 'react';
import SettingStore from '../../stores/Setting.store';
import PropTypes from 'prop-types';
import SnackBar from 'node-snackbar';
import { ApiHandler } from 'cm-apptudio-api-sdk';

const IsNullEmptyOrUndefinedCheck = function (value) {
    if (value == "" || value == null || value == undefined)
        return true;
    else
        return false;
}
const geerateGUid = function () {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
const getGuid = function () {
    Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    return geerateGUid() + geerateGUid() + geerateGUid() + geerateGUid() + geerateGUid() + geerateGUid() + geerateGUid() + geerateGUid();
}
class CreateComment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Did: '',
            Comment: '',
            Attachment: []
        }
        this.saveHandler = this.saveHandler.bind(this);
        this.saveComment = this.saveComment.bind(this);
        this.fileUpload = this.fileUpload.bind(this);
        this.inputChangeHandler = this.inputChangeHandler.bind(this);
        this.controlFileUploadButton = this.controlFileUploadButton.bind(this);
    }
    componentDidMount() {

        if (this.props.SetChildMethodClick) this.props.SetChildMethodClick(this.saveComment)
    }

    inputChangeHandler(key, e) {
        switch (key) {
            case 'comment':
                this.setState({ Comment: e.target.value });
                break;

            default:
                break;
        }

    }
    validationCheck() {
        let flag = true;
        let message = "";
        const { IsCommentRequired, IsAttachmentRequired } = this.props;
        const { Comment, Attachment } = this.state;
        if (IsCommentRequired) {
            if (IsNullEmptyOrUndefinedCheck(Comment)) {
                flag = false;
                message = "Comment is required"
            }
        }
        else if (IsAttachmentRequired) {
            if (Attachment.length > 0) {
                flag = false;
                message = "Attachment is required"
            }
        }
        return { flag, message };
    }

    getAttachmentList() {
        return this.state.Attachment.map((m, index) => {
            return <p key={getGuid()}>{m.name}  <i style={{ cursor: 'pointer' }} className="fa fa-times" onClick={(index) => {
                var { Attachment } = this.state;
                Attachment.splice(index, 1);
                this.setState({ Attachment: Attachment })
            }} aria-hidden="true"></i>
                {m.url && <a download href={m.url}>View</a>}
            </p>
        })
    }

    fileUpload(e) {
        let { Attachment } = this.state;
        try {
            var obj = this;
            var filePath = e.target.files[0];
            Attachment.push(filePath);
            this.setState({ Attachment: Attachment });
            console.log(this);
            console.log(this.props.MID);
            //e.target.value = null;
        } catch (ex) { }
    }
    controlFileUploadButton(index, e) {
        const { MID } = this.props;
        var id = "#attachments" + MID;
        $(id).click();
    }
    saveHandler() {
        let self = this;
        showLoader("", "Please Wait..", 0);
        this.saveComment(function () {
            hideLoader();
            SnackBar.show({
                text: "Comment has been saved successfully.",
                pos: 'bottom-center',
                showActionButton: false
            });
            self.setState({
                Comment: '',
                Attachment: []
            });
            if (self.props.onSuccess)
                self.props.onSuccess();

        })
    }

    saveComment(callBack) {
        if (this.validationCheck()) {
            let { Comment, Attachment } = this.state;

            if (IsNullEmptyOrUndefinedCheck(Comment) && Attachment.length == 0) {
                if (callBack)
                    callBack(false);
                return false;
            }
            let { MID, ModuleID } = this.props;
            let data = {
                Application: 'CEM',
                Body: Comment,
                Date: new Date().getTime(),
                IsActive: 'true',
                MID: MID,
                ModuleID: ModuleID,
                Parent: '0',
                Subject: 'Comment',
                UserID: CommonStore.getUserId(),
                UserName: CommonStore.getUserFullName(),
                AttachmentList: Attachment
            }

            var apiHandler = new ApiHandler(SettingStore.getNosqlUrl(), SettingStore.getAppKey(), SettingStore.getKey());
            apiHandler.save("Premise_DiscussionMessage", data, function () {

            });
        }
    }
    render() {
        const { Comment } = this.state,
            { IsSaveButtonShow, MID,Title } = this.props;
        return (
            <div>
                <div className="form-group">
                <label>{Title || "Comment" }</label>
                    <textarea value={Comment} onChange={this.inputChangeHandler.bind(null, "comment")} className="form-control"></textarea>
                    <input id={"attachments" + MID} style={{ display: 'none' }} type="file" name="file" accept="*" onChange={this.fileUpload} />
                    <button style={{ marginTop: '10px' }} type="button" onClick={this.controlFileUploadButton} className="btn btn-default btn-sm">
                        <span className="glyphicon glyphicon-paperclip" aria-hidden="true"></span> Add Attachment
                    </button>
                    {this.getAttachmentList()}
                </div>
                {IsSaveButtonShow == true ? <button style={{ marginTop: '0px' }} type="button" onClick={this.saveHandler} className="btn btn-default btn-primary">Save
                </button> : null}
            </div>
        );
    }
}

CreateComment.propTypes = {
    Title:PropTypes.string,
    onSuccess: PropTypes.func,
    SetChildMethodClick: PropTypes.func,
    ModuleID: PropTypes.string,
    Did: PropTypes.string,
    MID: PropTypes.string,
    IsCommentRequired: PropTypes.bool,
    IsAttachmentRequired: PropTypes.bool,
    IsSaveButtonShow: PropTypes.bool
};

CreateComment.defaultProps = {
    Title:undefined,
    onSuccess: undefined,
    SetChildMethodClick: undefined,
    Did: "0",
    ModuleID: "0",
    MID: '0',
    IsCommentRequired: false,
    IsAttachmentRequired: false,
    IsSaveButtonShow: true
}

export default CreateComment;