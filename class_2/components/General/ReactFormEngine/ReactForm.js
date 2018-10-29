import React, { Component } from 'react';

import $ from 'jquery';

import getForm from './ReactFormEngine';

// // import LeaseForm1Data from './Stores/LeaseForm1.form.json';
// import _FormData from './Stores/TestingWithRepeater.form.json';
// // import _FormData from './Stores/LeaseForm1.form.json';
// import _LeaseForm1Data from './Stores/LeaseForm1.form.json';

// import _LeaseForm2Data from './Stores/LeaseForm2.form.json';

// import _LeaseForm3Data from './Stores/LeaseForm3.form.json';



// var _d = JSON.parse(_FormData.Json);
// console.log(_d);
var testOnChange = function (e) {

};

// var response = test(
//     React, 
//     $, 
//     {
//         Host: 'http://dev-nosql.premisehq.co' + '/api/',
//         Premise: 'http://dev.premisehq.co' + '/',
//         AppKey: 'cc3fdca374904ae89e3393779805efaf',
//         Key: '201701230138VynxiSBuPB/ZeTeWab1WIA=='
//     }, 
//     // '', // Did
//     // _d, 
//     {
//         onChange: null, // testOnChange 
//     }
// );
// console.log(response);

export default class ReactForm extends Component {
    constructor (props) {
        super(props);

        this.state = {

        }

    }

    componentDidMount () {

        if (process.env.NODE_ENV !== 'production') {
            setTimeout(() => {
                window._test = this.refs['FE'];
            }, 1000);            
        }

        var self = this;

        this._form = getForm(
            // React,
            // $,
            {
                Host: 'http://dev-nosql.premisehq.co' + '/api/',
                // Premise: 'http://dev.premisehq.co' + '/',
                AppKey: 'cc3fdca374904ae89e3393779805efaf',
                Key: '201701230138VynxiSBuPB/ZeTeWab1WIA=='
            },
            // '',
            // _d,
            {
                onChange: {
                    'LeaseType': function (e, v) {
                        // console.log(e, v);
                        return {
                            LeaseType: e.target.value,
                            StatusIfOther: e.target.value
                        }
                    },
                    '__default__': function (e) {
                        if (e._fileInput === true) {
                            console.log(e);
                            return;
                        }
                        console.log('Master elements data change event! (Except for file input)');
                    }
                }, // testOnChange
                repeater_onChange: {
                    'TWRRepeater3': function () {
                        console.log('From TWRRepeater3');
                    },
                    'TWRRepeater5': {
                        CooperatingBrokerName: function () {
                            console.log('From TWRRepeater5, but for certain .id -> ' + 'CooperatingBrokerName');
                        },
                        '__default__': function () {
                            console.log('From TWRRepeater5 - For rest of the ids!')
                        }
                    },
                    __default__: function () {
                        console.log('From rest of the repeater which hasn\'t been initialized!')
                    }
                },
                onLoadStart: function (d) {
                    console.log('onLoadStart callBack', d);
                },
                onLoad: function (d) {
                    var comp = self.refs['FE'];

                    var formName = d.formName;
                    if (formName == 'LeaseForm1') {
                        comp.setData({
                            master: {
                                StatusIfOther: 'Hello From Another Side'
                            }
                        })
                    } else if (formName == 'LeaseForm2') {
                        comp.setData({
                            master: {
                                DealTypeIfOther: "Let's test!!"
                            },
                            repeater: [
                                {
                                    PostURL: 'Repeater1',
                                    index: 0,
                                    data: {
                                        StepUp: '23.123'
                                    }
                                }
                            ]
                        })

                        // or,
                        // comp.setData({
                        //     master: {
                        //         DealTypeIfOther: "Let's test!!"
                        //     },
                        //     repeater: [
                        //         {
                        //             PostURL: 'Repeater1',
                        //             Did: {{SOME_DID of that module}},
                        //             data: {
                        //                 StepUp: '23.123'
                        //             }
                        //         }
                        //     ]
                        // })
                        
                    }

                    console.log('onLoad callBack', d);
                },
                onBeforeSave: function (d) {
                    console.log('onBeforeSave callBack', d);
                    return window.__prohibitSave ? false : true;
                    // return d.repeaterModules.length ? false : true;
                },
                onSave: function (d) {
                    console.log('onSave callBack', d);
                },
                repeater_onSave: function (d) {
                    console.log('repeater_onSave callBack', d);
                },
                onGettingPageList: function (d) {
                    console.log('onGettingPageList callBack', d);
                },
                onGettingSubPageList: function (d) {
                    console.log('onGettingSubPageList callBack', d);
                },
                onGettingFormData: function (d) {
                    // console.log('onGettingFormData callBack', d);
                },
                onBeforePageChange: function (d) {
                    console.log('onBeforePageChange callBack', d);
                },
                onBeforeRepeaterAddition: function (d) {
                    console.log('onBeforeRepeaterAddition callBack', d);
                    if (d.repeaterDids.length >= 3) {
                        return false;
                    }
                },
                onRepeaterAddition: function (d) {
                    console.log('onRepeaterAddition callBack', d);
                },
                onBeforeRepeaterDeletion: function (d) {
                    console.log('onBeforeRepeaterDeletion callBack', d);
                    // return false;
                },
                onRepeaterDeletion: function (d) {
                    console.log('onRepeaterDeletion callBack', d);
                },
                onBeforeSubPageDeletion: function (d) {
                    console.log('onBeforeSubPageDeletion callBack', d);
                    // return false;
                },
                onSubPageDeletion: function (d) {
                    console.log('onSubPageDeletion callBack', d);
                },
                onError: function (d, res) {
                    alert("Some error occurred!\nCheck the console!");
                    console.log('onError callBack', d, res);
                },
                onBeforeCascade: function (d) {
                    console.log('onBeforeCascade callBack', d);
                    // return false;
                },
                onCascade: function (d) {
                    console.log('onCascade callBack', d);
                }
            }
        );

        this.forceUpdate();
    }

    componentWillUnmount () {

    }

    _test (e) {
        console.log('hello');
    }

  	render() {
        var self = this;
        var stateObj = this.state;

        var haha = React.createElement(
            'span',
            {
                id: 'Hello'
            },
            [
                <span key='1'>Hello </span>,
                <span key='2'>World</span>
            ]
        )

        var Children = this._form || null; 

        var cProps = {
            master: true,
            ref: "FE",
            // data: _d,
            // formName: 'TestingWithRepeater',
            formName: 'LeaseForm1',
            // formName: 'Hello',
            // formName: 'LeaseForm2',
            // formName: 'LeaseForm3',
            // Did: '1ff2b786267641ac9dfbd222233d9e43', // For TestingWithRepeater
            // Did: '9fef5d03655f4c20807dcd3a209161ef', // For LeaseForm1
            // Did: 'b1270e539d244b79b3b1aabc71a98c7d', // For LeaseForm1
            Did: '19650d2403fd4dc5b7325e246a515b4b', // For LeaseForm1
            // Did: '32943b2d174747239137a4841755de5e', // For LeaseForm2
            // Did: '891441ce1fb443fb8a15bbfabad6550b', // For LeaseForm3
            // Did: 'c0cdef560aa8490dbec65aa8790581f8', // For LeaseForm3
            // Did: '',
            // offlineSupport: true,
        } 

        return (
            <div>
                {Children ? <Children {...cProps} /> : null}
      		</div>
    	);
  	}
}




