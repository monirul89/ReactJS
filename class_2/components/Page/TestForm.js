import React from 'react';
import Premise from './Premise';
import { Header, SectionHeader } from 'cm-apptudio-ui';
import SettingStore from '../../stores/Setting.store';
import { ApiHandler } from 'cm-apptudio-api-sdk';
import Setting from '../../stores/Setting.store';


class TestForm extends Premise {
    render() {
        return (
            <div className="areaForm">
                <div className="form-group">
                    <label htmlFor="fname">Full Name : </label>
                    <input className="form-control" type="text" id="fullName" name="fullName" placeholder="Your name..." />
                </div>
                <div className="form-group">
                    <label htmlFor="lname">Email Address : </label>
                    <input className="form-control" type="text" id="emailAddress" name="emailAddress" placeholder="Your Email..." />
                </div>
                <div className="form-group">
                    <label htmlFor="lname">Subject : </label>
                    <input className="form-control" type="text" id="subject" name="subject" placeholder="Subject..." />
                </div>
                <div className="form-group">
                    <label htmlFor="subject">Message  : </label>
                    <textarea className="form-control" id="message" name="message" placeholder="Write something.." style={{ "height": "60px" }}></textarea>
                </div>
                <div className="form-group" style={{ "paddingTop": "20px", "textAlign": "right" }}>
                    <input className="btn btn-default" type="submit" value="Submit" />
                </div>
            </div>
        );
    }
}

export default TestForm;
