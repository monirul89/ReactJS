import Premise from './Premise';
import React from 'react';
import { ApiHandler } from 'cm-apptudio-api-sdk';
import Setting from '../../stores/Setting.store';
import SettingStore from '../../stores/Setting.store';


import { Header, SectionHeader, TextBox, RadioButton, CheckBox, Textarea } from 'cm-apptudio-ui';

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
            FldA: '',
            FldB: '',
            FldC: ''
        }
        this.inputChangeHandler = this.inputChangeHandler.bind(this);
        this.saveHandler = this.saveHandler.bind(this);
        this.updateHandler = this.updateHandler.bind(this);
        // this.deleteHandler = this.deleteHandler.bind(this);
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
            apiHandler.update("4035f4268fce459a9005f65ffc4c11ec","TestHQ", data, function () {
                alert('update');
            });
    }
    // deleteHandler() {
    //     let self = this;
    //     let { FldA, FldB } = this.state;
    //     let data = {
    //         FldA: FldA,
    //         FldB: FldB,
    //         FldC: new Date().getTime()
    //     }
    //     var apiHandler = new ApiHandler(SettingStore.getNosqlUrl(), SettingStore.getAppKey(), SettingStore.getKey());
    //         apiHandler.delete("4035f4268fce459a9005f65ffc4c11ec","TestHQ", data, function () {
    //             alert('delete');
    //         });
    // }

    render() {
        const { FldA, FldB } = this.state;

        var options = [{ value: "a", label: 'a' }, { value: "b", label: 'b' }];
        return <div className="page">
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="fullName">FldA</label>
                        <TextBox value={FldA} className="form-control" placeHolder={"FldA"} onChange={this.inputChangeHandler.bind(null, "FldA")} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputEmail1">FldB</label>
                        <TextBox value={FldB} className="form-control" placeHolder={"FldB"} onChange={this.inputChangeHandler.bind(null, "FldB")} />
                    </div>

                    <button style={{ marginTop: '0px' }} type="button" onClick={this.saveHandler} className="btn btn-primary">Save
                </button>
                <button style={{ marginTop: '0px' }} type="button" onClick={this.updateHandler} className="btn btn-primary">Update
                </button>
                </div>
            </div>
        </div>
    }
}

export default test;
