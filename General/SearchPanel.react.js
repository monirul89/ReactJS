import React from 'react';
import { Label, Button, TextBox } from 'cm-apptudio-ui';

import SettingStore from '../../stores//Setting.store';

const SearchPanel = function (props) {
    const stateObj = props.state;
    return <div className={'className' in props ? props.className : "row row-horizontal search-container"} style={props.style || null}>

        <div className="col-md-2">
            <TextBox className="form-control" placeHolder={"Search Field 1"} />
        </div>
        <div className="col-md-2">
            <TextBox className="form-control" placeHolder={"Search Field 2"} />
        </div>

        <div className="col-md-2">
            <Button onClick={props.onSearch} className="btn button-default">Search</Button>
        </div>
    </div>
};

export default SearchPanel;
