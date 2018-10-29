import React from 'react';
import Premise from './Premise';
import { ApiHandler } from 'cm-apptudio-api-sdk';
import Setting from '../../stores/Setting.store';
import SettingStore from '../../stores/Setting.store';
import UserStore from '../../stores/User.store';
import SearchPanel from '../General/SearchPanel.react';
import { Header, SectionHeader, TextBox, RadioButton, CheckBox, Textarea, Label, Button, DataTable } from 'cm-apptudio-ui';

var totalData = 0;
var tableName = 'TestHQ';
var column = [
    { key: '', label: 'Action', sortable: true },
    { key: 'FldA', label: 'Employee Name', sortable: true },
    { key: 'FldB', label: 'Emplyee Email', sortable: true },
    { key: 'FldC', label: 'Contact Number', sortable: true }    
];



class EmployeeTableForm extends Premise {
    componentDidMount() {
        var apiHandler = new ApiHandler(Setting.getNosqlUrl(), Setting.getAppKey(), Setting.getKey());
        apiHandler.getAll("User System", this.test);

        this.refs['TableGrid'].processTable('');
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
            case 'FldC':
                this.setState({ FldC: e.target.value });
                break;
            default:
                break;
        }
    }

    saveHandler() {
        let self = this;
        let { FldA, FldB, FldC } = this.state;
        let data = {
            FldA: FldA,
            FldB: FldB,
            FldC: FldC
        }
        var apiHandler = new ApiHandler(SettingStore.getNosqlUrl(), SettingStore.getAppKey(), SettingStore.getKey());
        apiHandler.save("TestHQ", data, function () {
            alert('Save');
        });
    }

    updateHandler() {
        let self = this;
        let { FldA, FldB, FldC } = this.state;
        let data = {
            FldA: FldA,
            FldB: FldB,
            FldC: FldC
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
        const { FldA, FldB, FldC } = this.state;
        var x = {
            url: SettingStore.getNosqlUrl(),
            appkey: SettingStore.getAppKey(),
            token: Setting.getKey()
        };

        var options = [{ value: "a", label: 'a' }, { value: "b", label: 'b' }];

        return <div className="page">
            <div className="row">
                <div className="col-md-6 col-md-offset-3">
                    <div className="form-group">
                        <label htmlFor="fullName">Emplyee Name :</label>
                        <TextBox value={FldA} className="form-control" placeHolder={"Your Name..."} onChange={this.inputChangeHandler.bind(null, "FldA")} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputEmail1">Emplyee Email :</label>
                        <TextBox value={FldB} className="form-control" placeHolder={"Email Address..."} onChange={this.inputChangeHandler.bind(null, "FldB")} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="exampleInputNumber">Contact Number :</label>
                        <TextBox value={FldC} className="form-control" placeHolder={"Contact Number..."} onChange={this.inputChangeHandler.bind(null, "FldC")} />
                    </div>

                    <button style={{ marginTop: '0px' }} type="button" onClick={this.saveHandler} className="btn btn-primary">Save
                    </button>
                </div>
            </div>
            <DataTable ref="TableGrid" onTableParamChange={this.onTableParamChange} module={ tableName } columns={ column } {...x} />
        </div>
    }
}

export default EmployeeTableForm;
