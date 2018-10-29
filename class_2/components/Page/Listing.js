import React from 'react';
import Premise from './Premise';
import {DataTable, Header, SectionHeader} from 'cm-apptudio-ui';
import Setting from '../../stores/Setting.store';

var fullcolumn=[
    {
        "key": "FacilityID",
        "label": "Facility ID"
    },
    {
        "key": "Name",
        "label": "Store Name"
    },
    {
        "key": "Address1",
        "label": "Address"
    },
    {
        "key": "City",
        "label": "City"
    },
    {
        "key": "ProvinceState",
        "label": "Province"
    },
    {
        "key": "Country",
        "label": "Country"
    },
    {
        "key": "Mail Code",
        "label": "Postal Code"
    },
    {
        "key": "WeatherStation",
        "label": "Weather Station"
    }




  ]
class Listing extends Premise {
    componentDidMount(){
        this.refs["TableGrid"].processTable('');
    }
    render(){
        return <div className="page">
            <Header HeaderTitle="Title of the page" HeaderDescription="Description of the page/action/any info about the page"></Header>

            <DataTable
            rowLengthPerPage={5}
            columns={fullcolumn}
            ref="TableGrid"
            module={'EA_SiteInfo_001'}
            url={Setting.getNosqlUrl()}
            appkey={Setting.getAppKey()}
            token={Setting.getKey()}
            export={true}
            />

          </div>

    }
}

export default Listing;
