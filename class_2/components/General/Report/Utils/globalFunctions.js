//import ActionCreator from "../Actions/ActionCreator";

//import NavStore from "../Stores/NavStore";

//import ServerAPI from "./ServerAPI";
//import manualAlert from "./manualPrompter";

//var documentAll = document.all;

var utilityAnchor = document.createElement('a');
window.navigate = function (href, target) {
	utilityAnchor.href = href;
	if (target) utilityAnchor.target = target;
	else utilityAnchor.target = "_self";
	var utilityAnchorEvent = document.createEvent("MouseEvents");
	utilityAnchorEvent.initEvent("click", true, true); 
	utilityAnchor.dispatchEvent(utilityAnchorEvent);
}