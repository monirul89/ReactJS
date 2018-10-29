import React from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';

var ultimateStartDate = moment(0);
var ultimateEndDate = moment(3187188000000);

var callBack = null;
export default class DateFilter extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			//startDate: moment(0),
			//endDate: moment(3187188000000)
			startDate: null,
			endDate: null
		}

		if (this.props.callBack) {
			callBack = this.props.callBack;
			callBack(0, 3187188000000, true);
		}

		this.denyUpdate = false;
		this._filterLast = this._filterLast.bind(this);
		this._clearFilter = this._clearFilter.bind(this);
		this._dateChangeStart = this._dateChangeStart.bind(this);
		this._dateChangeEnd = this._dateChangeEnd.bind(this);
	}

	shouldComponentUpdate () {
		if (this.denyUpdate) {
			return this.denyUpdate = false;
		} else {
			return true;
		}
	}

	componentWillReceiveProps () {
		this.denyUpdate = true;
	}

	_callBackParent (startDate, endDate, clearFlag) {
		if (callBack) callBack(startDate, endDate, clearFlag);
	}

	_filterLast (unit) {
		var startDate = moment().subtract(1, unit);
		var endDate = moment();

		this.setState({
			startDate: startDate,
			endDate: endDate
		});
		this._callBackParent(startDate, endDate);
	}

	_clearFilter () {
		var startDate = ultimateStartDate;
		var endDate = ultimateEndDate;

		this.setState({
			//startDate: startDate,
			//endDate: endDate
			startDate: null,
			endDate: null
		});
		this._callBackParent(startDate, endDate, true);
	}

	_dateChangeStart (date) {
		var endDate = this.state.endDate || ultimateEndDate;
		if (date != null && date > endDate) return;
		this.setState({
		    startDate: date
		});
		this._callBackParent(date || ultimateStartDate, endDate);
	}

	_dateChangeEnd (date) {
		var startDate = this.state.startDate || ultimateStartDate;
		if (date != null && date < startDate) return;
		this.setState({
		    endDate: date
		});
		this._callBackParent(startDate, date || ultimateEndDate);
	}

	render () {
		var divStyle = {
			padding: '7px 8px 10px 8px',
			display: 'inline-block',
			verticalAlign: 'top'
		}

		return (
			<div>
				<div className="text-center">
					<label>Date Filter (mm/dd/yyyy)</label>
				</div>
				<div className="text-center">
					<div style={divStyle}>
						<DatePicker selected={this.state.startDate}
									startDate={this.state.startDate}
									endDate={this.state.endDate}
									onChange={this._dateChangeStart} 
									isClearable
									showYearDropdown />
					</div>

					<div style={divStyle}>
						<DatePicker selected={this.state.endDate}
									startDate={this.state.startDate}
									endDate={this.state.endDate}
									onChange={this._dateChangeEnd} 
									isClearable
									showYearDropdown />
					</div>

					<div className="dropdown hover-skip" style={divStyle}>
					  	<button className="btn btn-sm btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
					    	<span style={{marginRight: '3px'}}>Options</span>
					    	<span className="caret"></span>
					  	</button>
					  	<ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
					  		{/*<li onClick={this._filterLast.bind(this, 'day')}><a href="javascript: void(0)">Last Day</a></li>*/}
					    	<li onClick={this._filterLast.bind(this, 'week')}><a href="javascript: void(0)">Last Week</a></li>
					    	<li onClick={this._filterLast.bind(this, 'month')}><a href="javascript: void(0)">Last Month</a></li>
					    	<li onClick={this._filterLast.bind(this, 'year')}><a href="javascript: void(0)">Last Year</a></li>
					  	</ul>
					</div>

					<div style={divStyle}>
						<button onClick={this._clearFilter} className="btn btn-sm btn-primary"><i className="fa fa-refresh"></i> Clear Filter</button>
					</div>
				</div>
				{/*<div className="text-center">
					<div style={divStyle}>
						From <span style={{color: '#4f718e', fontWeight: 'bold'}}>{moment(this.state.startDate).format('MMM D, YYYY')}</span> to <span style={{color: '#bf584d', fontWeight: 'bold'}}>{moment(this.state.endDate).format('MMM D, YYYY')}</span>
					</div>
				</div>*/}
	    	</div>
		)
	}
}
