import React from 'react';
import Premise from './Premise';
import { Header, SectionHeader } from 'cm-apptudio-ui';
import SettingStore from '../../stores/Setting.store';
import { ApiHandler } from 'cm-apptudio-api-sdk';
import Setting from '../../stores/Setting.store';

const tableName = "MyContact"
var ColumnsName = [
    { label: "ContactName" },
    { label: "Email" },
    { label: "Phone" }
];
ColumnsName[0].sortable = false;
var current = 1;
const minimumRowShow = 10;
var totalRows = 0;

class NewContact extends Premise {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            loaderState: "loading",
            loadingText: "Loading  data"
        };
        this.onTableParamChange = this.onTableParamChange.bind(this);
        this.loadInitialData = this.loadInitialData.bind(this);
    }
    componentDidMount() {
        this.loadInitialData()
    }

    loadInitialData() {
        var self = this;
        this.setState({ loaderState: 'loading' });
        var apiObj = {
            ModuleKey: tableName,
            Condition: this.getQuery(-1, -1),
            Distinct: '',
            Count: 'true'
        }
        var apiHandler = new ApiHandler(Setting.getNosqlUrl(), Setting.getAppKey(), Setting.getKey());
        apiHandler.count(this.getQuery(-1, -1), tableName, function (returnData) {
            totalRows = parseInt(returnData.Data);
            self.getItem(0, minimumRowShow);
        });
    }

    getQuery(skip, limit) {
        let query = "";
        let rowLimit = "";
        if (skip != -1 && limit != -1)
            rowLimit = "\"{ $skip:" + skip + "}\" , \"{ $limit:" + limit + " } \"";
        query = "[" + rowLimit + "]";
        return query;
    }
    processData(data) {
        let list = [];
        $.each(data, function (index, formatData) {
            list.push([
                {
                    label: formatData.ContactName
                },
                {
                    label: formatData.Email
                },
                {
                    label: formatData.Phone
                }
            ]);
        });
        return list;
    }

    getItem(skip, limit) {
        var obj = this;
        var myMap = new Map();
        var apiObj = {
            ModuleKey: tableName,
            Condition: this.getQuery(skip, limit),
            Distinct: '',
            Count: ''
        }
        var apiHandler = new ApiHandler(Setting.getNosqlUrl(), Setting.getAppKey(), Setting.getKey());
        apiHandler.aggregate(this.getQuery(-1, -1), tableName, function (returnData) {
            var processData = obj.processData(JSON.parse(returnData.Data));
            obj.setState({
                loaderState: "done",
                list: processData
            });
        });
    }
    onTableParamChange(key, value) {
        if (key == "pageNumber") {
            this.setState({
                loaderState: "loading"
            })
            current = value;
            this.getItem((value - 1) * minimumRowShow, minimumRowShow);
        }
        else {
            return "0";
        }
    }
    render() {
        let { loaderState, loadingText, list } = this.state;
        return <div className="page col-xs-9">
            <div className="page-heading">
                <Header HeaderTitle="Conatact" HeaderDescription="Contact information description"></Header>
            </div>
            <div className="page-body">
                <Loader loaderTitle={loadingText} loaderState={loaderState} />
                <div className="section-heading">
                    <SectionHeader HeaderTitle="Conatacts"></SectionHeader>
                </div>
               
            </div>
        </div>
    }
}
export default NewContact;