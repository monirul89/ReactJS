import React from 'react';
/*import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Select from 'react-select';
import ClearIcon from 'material-ui/svg-icons/content/clear';*/

import TopLoader from '../General/TopLoader';

import commonFunctions from '../../Utils/commonFunctions';
import ServerAPI from '../../Utils/ServerAPI'

export default class ChartGenerator extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			
		}

		this.shouldComponentUpdate = commonFunctions.defaultShouldComponentUpdate;
		this.getLoaderArr = commonFunctions.getLoaderArr.bind(this);

	}


	componentDidMount () {
		
	}

	componentWillUnmount () {

	}

	componentDidUpdate () {

	}

	render () {
		var self = this;
		var stateObj = this.state;
		var property = stateObj.property;

		var containerStyle = {

		}

		return (
			<div ref="container" style={containerStyle}>
				<TopLoader data={stateObj.loaderArr}/>
				I will generate Chart!
			</div>
		)
	}
}
