export default {
	__utility__: {

	},

	// Still need to revert the display property back to its original state
	_getCssText: function (obj) {
		var cssText = "";
		Object.keys(obj).map(function (key) {
			cssText += " " + key + ": " + obj[key] + ";";
		})
		return cssText;
	},

	_getCssObject: function (str) {
		var obj = {};
		str.split(';').map((i) => {
			if (i) {
				var splitI = i.split(':');
				var key = (splitI[0] || '').trim().split('');
				var attr = '';
				var uCase = false;
				key.map((k) => {
					if (k == '-') {
						uCase = true;
					} else if (uCase) {
						uCase = false;
						attr += String.fromCharCode(k.charCodeAt(0) - 32);
					} else attr += k;
				})
				obj[attr] = splitI[1] || '';
			}
		})
		return obj;
	},

	slideUp: function (inputObj, callBack) {
		var self = this;
		var styleObj = inputObj.style;
		var styleHolder = {}, transitStyleHolder = {}, parser = 0;
		while (1) {
			var attr = styleObj[parser++];
			if (!attr) {
				break;
			}

			transitStyleHolder[attr] = styleHolder[attr] = styleObj[attr];
		}


		transitStyleHolder.height = inputObj.offsetHeight + "px";
		transitStyleHolder.overflow = "hidden";
		transitStyleHolder.transition = "height .38s ease-in-out";

		styleObj.cssText = this._getCssText(transitStyleHolder);

		setTimeout(function () {
			styleObj.height = "0px";
			setTimeout(function () {
				if (inputObj.offsetHeight == 0 || parseInt(styleObj.height) === 0) {
					styleHolder.display = "none";
				};
				styleObj.cssText = self._getCssText(styleHolder);
				if (callBack) callBack();
			}, 370);
		}, 10)
	},

	slideDown: function (inputObj, callBack) {
		var self = this;
		var startingHeight = inputObj.offsetHeight;
		var styleObj = inputObj.style;
		var styleHolder = {}, transitStyleHolder = {}, parser = 0;
		while (1) {
			var attr = styleObj[parser++];
			if (!attr) {
				break;
			}

			transitStyleHolder[attr] = styleHolder[attr] = styleObj[attr];
		}
		delete styleHolder.display;
		delete styleHolder.height;

		transitStyleHolder.display = "";
		transitStyleHolder.position = "absolute";
		transitStyleHolder.visibility = "hidden";
		transitStyleHolder.transition = "height .38s ease-in-out";

		styleObj.cssText = this._getCssText(transitStyleHolder);

		var intendedHeight = inputObj.offsetHeight;

		//styleObj.height = "0px";
		styleObj.height = startingHeight + "px";

		setTimeout(function () {
			delete transitStyleHolder.visibility;
			transitStyleHolder.height = intendedHeight + "px";
			styleObj.cssText = self._getCssText(transitStyleHolder);

			setTimeout(function () {
				styleObj.cssText = self._getCssText(styleHolder);
				if (callBack) callBack();
			}, 370);
		}, 10)

	},

	addListener: function (type, fn) {
		var utility = this.__utility__;

		if (!utility[type + 'Fns']) {
			utility[type + 'Fns'] = [];
			utility[type + 'FnsProcessed'] = [];
		}

		var newFn = function (e) {
			var token = Math.random();
			newFn._token = token;
			setTimeout(function () {
				if (token === newFn._token) {
					fn(e);
				}
			}, 220);
		}

		utility[type + 'Fns'].push(fn);
		utility[type + 'FnsProcessed'].push(newFn);
		window.addEventListener(type, newFn);
	},

	removeListener: function (type, fn) {
		var utility = this.__utility__;

		var foundIndex = utility[type + 'Fns'].findIndex(function (item) {return item === fn});
		if (foundIndex > -1) {
			var attachedFn = utility[type + 'FnsProcessed'][foundIndex];
			utility[type + 'Fns'].splice(foundIndex, 1);
			utility[type + 'FnsProcessed'].splice(foundIndex, 1);
			window.removeEventListener('resize', attachedFn);
		}
	},

	getDollarFormat: function (val, minFraction, maxFraction) {
		var options = {};
		if (typeof minFraction == "undefined") {
			options.minimumFractionDigits = 2;
		} else options.minimumFractionDigits = minFraction;

		if (typeof maxFraction != 'undefined') {
			options.maximumFractionDigits = maxFraction;
		}

		if (typeof val == "string") val = parseFloat(val.replace(/,|\$/g, ""));
		if (isNaN(val)) return " - ";
		return val.toLocaleString('en-US', options);
	},

	getRoute: function (index) {
		var preRouteSplitArr = window.location.hash.split('/');
		var preRoute = [];
		for (var i = 0; i < index; i++) preRoute.push(preRouteSplitArr[i]);
		return preRoute.join("/");
	},

	defaultShouldComponentUpdate: function (nextProps, nextState) {
		var denyUpdateKey = this.__denyUpdateKey || '__denyUpdate';

		if (this[denyUpdateKey]) {
			this[denyUpdateKey] = false;
			return false;
		} else return true;
	},

	getLoaderArr: function (data, type) {
		var type = type == "delete" ? 'delete' : 'add';
		var loaderArr = [];
		var prevLoaderArr = this.state.loaderArr;

		if (!Array.isArray(data)) data = [data];
		if (type == 'delete') {
			prevLoaderArr.map(function (item, index) {
				if (!data.find(function (subItem) {return subItem.id == item.id})) {
					loaderArr.push(item);
				}
			})
		} else {
			loaderArr = prevLoaderArr.concat(data);
		}

		return loaderArr;
	},

	getURLVar: function (key) {
		var search = window.location.search.substr(1);
		var val = ""; 
		search.split("&").find(function (item) {
			var splitItem = item.split('=');
			if (decodeURIComponent(splitItem[0]) == key) {
				val = decodeURIComponent(splitItem[1]);
				return true;
			} else return false;
		})

		return val;
	},

	getURLVar_Custom: function (search, key) {
		var val = ""; 
		search.split("&").find(function (item) {
			var splitItem = item.split('=');
			if (decodeURIComponent(splitItem[0]) == key) {
				val = decodeURIComponent(splitItem[1]);
				return true;
			} else return false;
		})

		return val;
	}
}