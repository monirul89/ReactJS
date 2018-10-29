import Premise from './Premise';
import React from 'react';

import { Header, SectionHeader, Textarea, Dropdown, TextBox, Label, Button, DataTable } from 'cm-apptudio-ui';
import { ApiHandler } from 'cm-apptudio-api-sdk';
import Setting from '../../stores/Setting.store';
import UserStore from '../../stores/User.store';
import SearchPanel from '../General/SearchPanel.react';

var totalData = 0;
var tableName = 'Premise_Notification';
var column = [
    { key: 'NotificationDate', label: 'Data', sortable: true },
    { key: 'BudgetNo', label: 'Budget No', sortable: true },
    { key: 'BudgetTitle', label: 'Customer', sortable: true },


];

class Notification extends Premise {
    constructor(props) {
        super(props);
        this.state = {
            date: null,
        };

        this.onTableParamChange = this.onTableParamChange.bind(this);
        this.loadTableData = this.loadTableData.bind(this);
        this.processData = this.processData.bind(this);
        this.setTableData = this.setTableData.bind(this);
        this.tableQuery = this.tableQuery.bind(this);

    }

    componentDidMount() {
        this.refs["TableGrid"].tableLoaderShow();
        this.loadTableData();
    }
    tableQuery(skip, limit) {
        let { date } = this.state,
            query = "", moduleQuery = "", customerQuery = "", dateQuery = "",
            commonQuery = '{Application:\'CEM\'}{ModuleID:\'CEM_V1_Budget\'}';

        if (skip != undefined && limit != undefined) {
            query = '["{$match:{$and:[' + commonQuery + ']}}","{ $skip:' + skip + '}" , "{ $limit:' + limit + ' }"]';
        }
        else {
            query = '["{$match:{$and:[' + commonQuery + ']}}"]';
        }
        return query;
    }
    loadTableData() {
        var apiHandler = new ApiHandler(Setting.getNosqlUrl(), Setting.getAppKey(), Setting.getKey()), obj = this;
        apiHandler.count(obj.tableQuery(), tableName, function (returnData) {
            if (returnData.Status == 'Success') {
                totalData = parseInt(returnData.Data);
                obj.setTableData(0, 10, 0);
            }
        });
    }
    processData(notifications) {
        let list = [];
        $.each(notifications, function (index, notification) {
            try {
                let note = JSON.parse(notification.NotificationDetails);

                list.push({
                    Did: notification.MID,
                    NotificationDate: new Date(notification.NotificationDate).toLocaleString(),
                    BudgetNo: note.BudgetNo,
                    BudgetTitle: note.BudgetTitle || "",

                });
            }
            catch (error) {
                console.log(error);
            }
        });
        return list;
    }
    setTableData(skip, limit, pageNumber) {
        let obj = this,
            apiHandler = new ApiHandler(Setting.getNosqlUrl(), Setting.getAppKey(), Setting.getKey());
        apiHandler.aggregate(obj.tableQuery(skip, limit), tableName, function (notifications) {
            if (notifications.Status == 'Success') {
                var processData = obj.processData(JSON.parse(notifications.Data));
                obj.refs["TableGrid"].processTableManually(processData, totalData, pageNumber);
            }
        });
    }
    onTableParamChange(eType, value) {
        if (eType == "pagechange") {
            let limit = 10,
                skip = value * limit;
            this.setTableData(skip, limit, value);
        }
    }

    render() {
        return (
            <div className="page">
                <Header HeaderTitle='Notifications'></Header>
                <div className="page-body">
                    <ul className="list-group list-inline table-legend" >
                        <li className="list-group-item borderless">
                            <div className="btn-info" style={{ paddingRight: "20px", marginRight: "8px", height: "10px", display: "inline-block", border: "1px outset #ccc", borderRadius: "5px" }}>
                            </div>
                            <span className="text-info">Submitted</span></li>
                        <li className="list-group-item borderless">
                            <div className="btn-warning" style={{ paddingRight: "20px", marginRight: "8px", height: "10px", display: "inline-block", border: "1px outset #ccc", borderRadius: "5px" }}>
                            </div>
                            <span className="text-info">In Progress</span></li>
                        <li className="list-group-item borderless">
                            <div className="btn-danger" style={{ paddingRight: "20px", marginRight: "8px", height: "10px", display: "inline-block", border: "1px outset #ccc", borderRadius: "5px" }}>
                            </div>
                            <span >Received</span></li>
                        <li className="list-group-item borderless">
                            <div className="btn-success" style={{ paddingRight: "20px", marginRight: "8px", height: "10px", display: "inline-block", border: "1px outset #ccc", borderRadius: "5px" }}>
                            </div>
                            <span>Approved</span></li>
                    </ul>
                    <SearchPanel/>
                    <DataTable ref="TableGrid" onTableParamChange={this.onTableParamChange} columns={column} />
                </div>
            </div>
        );
    }
}

export default Notification;