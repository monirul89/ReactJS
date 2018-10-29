import Premise from './Premise';
import React from 'react';
import { ApiHandler } from 'cm-apptudio-api-sdk';
import Setting from '../../stores/Setting.store';
import SettingStore from '../../stores/Setting.store';


import { Header, SectionHeader, TextBox, RadioButton, CheckBox, Textarea } from 'cm-apptudio-ui';

var tableName = 'TestHQ';

class test extends Premise {
    componentDidMount() {
        var apiHandler = new ApiHandler(Setting.getNosqlUrl(), Setting.getAppKey(), Setting.getKey());
        apiHandler.getAll("User System", this.test);
    }

    test() {

    }

    constructor(props) {
        super(props);
        this.state = {
            Did: '1d8624f6ab0b438e92e63bb43750e789',
            FldA: '',
            FldB: '',
            FldC: ''
        }
        this.inputChangeHandler = this.inputChangeHandler.bind(this);
        this.saveHandler = this.saveHandler.bind(this);
        this.updateHandler = this.updateHandler.bind(this);
        this.deleteHandler = this.deleteHandler.bind(this);
    }

    inputChangeHandler(key, e) {
        switch (key) {
            case 'FldA':
                this.setState({ FldA: e.target.value });
                break;
            case 'FldB':
                this.setState({ FldB: e.target.value });
                break;
            default:
                break;
        }
    }

    saveHandler() {
        let self = this;
        let { FldA, FldB } = this.state;
        let data = {
            FldA: FldA,
            FldB: FldB,
            FldC: new Date().getTime()
        }
        var apiHandler = new ApiHandler(SettingStore.getNosqlUrl(), SettingStore.getAppKey(), SettingStore.getKey());
        apiHandler.save("TestHQ", data, function () {
            alert('Save');
        });
    }

    updateHandler() {
        let self = this;
        let { FldA, FldB } = this.state;
        let data = {
            FldA: FldA,
            FldB: FldB,
            FldC: new Date().getTime()
        }
        var apiHandler = new ApiHandler(SettingStore.getNosqlUrl(), SettingStore.getAppKey(), SettingStore.getKey());
        apiHandler.update("1d8624f6ab0b438e92e63bb43750e789", "TestHQ", data, function () {
            alert('update');
        });
    }
    deleteHandler() {
        var { FldA, FldB, Did } = this.state;
        var query = "{Did:'" + Did + "'}";
        var apiHandler = new ApiHandler(SettingStore.getNosqlUrl(), SettingStore.getAppKey(), SettingStore.getKey());
        apiHandler.delete(query, "TestHQ", function () {
            alert('deleted');
        });
    }
    render() {
        const { FldA, FldB } = this.state;

        var options = [{ value: "a", label: 'a' }, { value: "b", label: 'b' }];
        return <div className="page">
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="fullName">Emplyee Name :</label>
                        <TextBox value={FldA} className="form-control" placeHolder={"Name..."} onChange={this.inputChangeHandler.bind(null, "FldA")} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputEmail1">Emplyee Email :</label>
                        <TextBox value={FldB} className="form-control" placeHolder={"Email..."} onChange={this.inputChangeHandler.bind(null, "FldB")} />
                    </div>

                    <button style={{ marginTop: '0px' }} type="button" onClick={this.saveHandler} className="btn btn-primary">Save
                </button>
                    <button style={{ marginTop: '0px' }} type="button" onClick={this.updateHandler} className="btn btn-primary">Update
                </button>
                    <button style={{ marginTop: '0px' }} type="button" onClick={this.deleteHandler} className="btn btn-primary">Delete
                </button>
                </div>
            </div>
        </div>
    }
}

export default test;