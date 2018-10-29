import Premise from './Premise';
import React from 'react';
import {Header,Textarea, Dropdown, TextBox, Label, Table,SectionHeader} from 'cm-apptudio-ui';


import CommonAction from '../../actions/Common.action';


class CreateContact extends Premise {
    constructor(props) {
        super(props);
        this.state = {
            ContactName: '',
            Email: '',
            loaderState: "done",
            loadingText: "Loading  data"
        };
        this.conatctNameChange = this.conatctNameChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
    }

    conatctNameChange(e) {
        this.setState({ ContactName: e.target.value });
    }
    emailChange(e) {
        this.setState({ Email: e.target.value });
    }
    dropDownChange(value, label, e) {
        alert(label);
    }
    buttonClick(){
        CommonAction.alertShow(true);
    }
    render() {
        let { loadingText, loaderState, ContactName, Email } = this.state;
        return <div className="page">

        <div className="page-body">
            <div className="row">
            <div className="col-md-12 bhoechie-tab-container">
                <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 bhoechie-tab-menu">
                  <div className="list-group">
                    <a href="#" className="list-group-item active text-center">
                      <h4 className="fas fa-user"></h4><br/>Profile
                    </a>
                    <a href="#" className="list-group-item text-center">
                      <h4 className="fas fa-lock"></h4><br/>Password Reset
                    </a>

                  </div>
                </div>
                <div className="col-lg-11 col-md-11 col-sm-11 col-xs-11 bhoechie-tab" style={{borderLeft: "1px solid #ddd"}}>

                    <div className="bhoechie-tab-content">

                          <h1 className="glyphicon glyphicon-plane" style={{fontSize:"14em",color:"#55518a"}}></h1>
                          <h2 style={{marginTop: "0",color:"#55518a"}}>Cooming Soon</h2>
                          <h3 style={{marginTop: "0",color:"#55518a"}}>Flight Reservation</h3>

                    </div>

                    <div className="bhoechie-tab-content active">

                        <PasswordReset/>

                    </div>
                  </div>
            </div>
      </div>
            </div>

        </div>
    }
}

export default CreateContact;
