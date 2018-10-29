import React from 'react';
import CommonUtils from '../../utils/CommonUtils';



export class DatePicker extends React.Component {
    componentDidMount() {
        let { onChange } = this.props;
        let self = this;
        $('.datepicker1').datepicker({
            changeMonth: true,
            changeYear: true,
            onClose: function (dateText, datePickerInstance) {
                onChange(dateText);
            }
        });
    }

    render() {
        var props = this.props;

        return (
            <input
                className="form-control"
                value={props.value}
                style={props.style || { width: '170px', cursor: 'pointer' }}
                className="form-control datepicker1"
                readOnly
                ref="Date"
                type="text"
            />
        );
    }
}

