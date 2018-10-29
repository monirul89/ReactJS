var includeAnimateCSS = function () {
    var allStyleSheets = document.styleSheets, parser = 0, len = allStyleSheets.length, animateCssFound = false;
    
    while (parser < len) {
        parser++;
        var sheetLink = allStyleSheets[parser - 1].href;
        if (!sheetLink) continue;
        if (sheetLink.search(/animate.*css/) > -1) {
            animateCssFound = true;
            break;
        }
    }

    if (!animateCssFound) {
        var animateCssScript = document.createElement('link');
        animateCssScript.rel = "stylesheet";
        animateCssScript.href = "https://cdn.jsdelivr.net/animatecss/3.5.1/animate.min.css";
        document.head.appendChild(animateCssScript);
    }
}

var self = {};
var autoHideRequestCount = 0;

var manualAlert = function (msg, header, data) {
    if (typeof data == "string") {
        var givenType = data;
        data = {};
        data.type = givenType;
    } else if (typeof data != 'object') data = {};
    
    var type = data.type; // default behaviour -> info
    type = data.type = type || "info";  
    header = header || String.fromCharCode(type.charCodeAt(0) - 32) + type.substr(1, 10);
    data.alertPosition = data.alertPosition || 'centerMid';

    if (typeof manualAlert_createdAlertBox == 'object' && manualAlert_createdAlertBox != null) {
        var reInitiateNow = function () {
            //if (manualAlert_createdAlertBox.hidden) manualAlert_createdAlertBox.reInitiateFunc(msg, header, data);
            autoHideRequestCount++;
            manualAlert_createdAlertBox.reInitiateFunc(msg, header, data);
        }

        if (manualAlert_createdAlertBox.getEngagedValue()) {
            if (!data.forceShow) return;
            var checkEngaged = setInterval(function () {
                if (!manualAlert_createdAlertBox.getEngagedValue()) {
                    clearInterval(checkEngaged);
                    reInitiateNow();
                }
            }, 20);
        } else reInitiateNow();
        return;
    }

    var attentionGrabberClasses = ['flash', 'shake', 'rollIn', 'zoomInLeft', 'rotateIn', 'flipInY', 'bounceInDown', 'bounceInUp', 'wobble'];
    var fadeOutClasses = ['bounceOut', 'bounceOutUp', 'bounceOutLeft', 'bounceOutRight', 'bounceOutDown', 'fadeOutDownBig', 'fadeOutUpBig', 'lightSpeedOut', 'rotateOut', 'zoomOut', 'zoomOutUp', 'zoomOutDown'];
    var fadeInClasses = ['fadeInDownBig', 'fadeIn', 'fadeInUpBig', 'zoomIn', 'zoomInUp', 'zoomInLeft', 'zoomInDown', 'zoomInRight', 'slideInLeft', 'slideInRight', 'rotateIn', 'lightSpeedIn'];
    
    var engaged = false;

    var initiate, reInitiate, userCustomizationFunc;

    var overlayObj = {};

    var alertBox = {},
        alertHeader = {},
        alertTitle = {},
        alertCloser = {},
        alertBody = {},
        alertFooter = {},
        alertConfirmButton = {},
        alertRejectButton = {};

    var reactivateCloseButton = false, autoHideSkip = false;

    self.centerMid = function () {
        alertBox.style.removeProperty('right');
        alertBox.style.left = (window.innerWidth - alertBox.offsetWidth) / 2 + 'px';
        alertBox.style.top = (window.innerHeight - alertBox.offsetHeight) / 2 + 'px';
    }

    self.leftTop = function () {
        alertBox.style.removeProperty('right');
        alertBox.style.left = "3%";
        alertBox.style.top = "5%";
    }

    self.rightTop = function () {
        alertBox.style.removeProperty('left');
        alertBox.style.right = "3%";
        alertBox.style.top = "5%";
    }

    var hideAlertBox = function (autoHiderCaller, requestCount) {
        if (autoHiderCaller !== true && data.autoHide) autoHideSkip = true;
        fadeOutAlertBox();
        overlayObj.hidden = true;
        window.removeEventListener('resize', finishAnimation);
        //autoHideRequestCount = 0;
    }

    var showAlertBox = function () {
        overlayObj.hidden = false;
        manualAlert_createdAlertBox.hidden = false;
        window.addEventListener('resize', finishAnimation);
    }

    var finishAnimation = function () {
        fadeInAlertBox();
        try{
            self[data.alertPosition]();
        } catch (ex) {
            self.centerMid();
        }
        //alertBox.style.left = (window.innerWidth - alertBox.offsetWidth) / 2;
        //alertBox.style.top = (window.innerHeight - alertBox.offsetHeight) / 2;
    }

    var fadeInAlertBox = function () {
        engaged = true;
        var cssClass;
        try {
            cssClass = data.transitionEffect.in;
        } catch (ex) {
            var classGrabberIndex = Math.round(Math.random() * (fadeInClasses.length - 1));
            cssClass = fadeInClasses[classGrabberIndex];
        }
        alertBox.classList.add(cssClass);
        setTimeout(function () {
            alertBox.classList.remove(cssClass);
            engaged = false;
        }, 1000);
    }

    var fadeOutAlertBox = function () {
        engaged = true;
        var cssClass;
        try {
            cssClass = data.transitionEffect.out;
        } catch (ex) {
            var classGrabberIndex = Math.round(Math.random() * (fadeOutClasses.length - 1));
            cssClass = fadeOutClasses[classGrabberIndex];
        }
        alertBox.classList.add(cssClass);
        setTimeout(function () {
            alertBox.hidden = true;
            alertBox.classList.remove(cssClass);
            engaged = false;
        }, 1000);
    }

    var flashAlertBox = function () {
        var classGrabberIndex = Math.round(Math.random() * (attentionGrabberClasses.length - 1)); 
        alertBox.classList.add(attentionGrabberClasses[classGrabberIndex]); 
        setTimeout(function () {
            alertBox.classList.remove(attentionGrabberClasses[classGrabberIndex]); 
        }, 1000);
    }

    var createOverlayFunc = function () {
        overlayObj = document.createElement('div');
        overlayObj.style.cssText = "position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 999999; background-color: rgba(0, 0, 0, .1);";
        overlayObj.addEventListener('click', flashAlertBox);
    }
    
    var createAlertBoxFunc = function () {
        alertBox = document.createElement('div');
        alertBox.className = "panel panel-content animated";
        alertBox.classList.add('panel-' + type);
        alertBox.style.cssText = "position: fixed; width: 400px; z-index: 99999999;";

        alertHeader = document.createElement('div');
        alertHeader.className = "panel-heading";

        alertTitle = document.createElement('b');
        alertTitle.className = "panel-title";
        alertTitle.innerHTML = header;
        alertTitle.style.fontSize = "18px";

        alertCloser = document.createElement('button');
        alertCloser.className = "btn btn-" + type + " btn-xs fa fa-close";
        alertCloser.style.cssText = "float: right; font-size: .9em;";
        alertCloser.addEventListener('click', hideAlertBox);

        alertFooter = document.createElement('div');
        alertFooter.style.cssText = "text-align: center; margin-bottom: 12px;";
        if (!data.isConfirmed) alertFooter.hidden = true;

        alertConfirmButton = document.createElement('button');
        alertConfirmButton.className = "btn btn-" + (type != "success" ? "danger" : "success");
        alertConfirmButton.style.cssText = "padding: 2px 16px;";
        alertConfirmButton.innerHTML = " Yes ";
        alertConfirmButton.addEventListener('click', data.isConfirmed || null);
        alertConfirmButton.addEventListener('click', hideAlertBox);

        alertRejectButton = document.createElement('button');
        alertRejectButton.className = "btn btn-primary";
        alertRejectButton.style.cssText = "margin-left: 20px; padding: 2px 16px;";
        alertRejectButton.innerHTML = " No ";
        alertRejectButton.addEventListener('click', hideAlertBox);        
        alertRejectButton.addEventListener('click', data.isConfirmed ? (data.isRejected || null) : null);

        alertBody = document.createElement('div');
        alertBody.className = "panel-body";
        alertBody.innerHTML = msg;

        alertHeader.appendChild(alertTitle);
        alertHeader.appendChild(alertCloser);
        alertFooter.appendChild(alertConfirmButton);
        alertFooter.appendChild(alertRejectButton);
        alertBox.appendChild(alertHeader);
        alertBox.appendChild(alertBody);
        alertBox.appendChild(alertFooter);
    }

    userCustomizationFunc = function () {
        if (typeof data.alertPeriod != 'number') {
            data.alertPeriod = 6;
        } else data.autoHide = true;

        if (data.type == "info") {
            data.autoHide = true;
        }

        if (data.autoHide) {
            var currentRequest = autoHideRequestCount;
            setTimeout(function () {
                 if (autoHideRequestCount == currentRequest) {
                    autoHideRequestCount = 0;
                } else return;
                if (autoHideSkip) {
                    autoHideSkip = false;
                    return;
                }
                autoHideSkip = false;
                hideAlertBox(true);
            }, data.alertPeriod * 1000)
            overlayObj.hidden = true;
        }

        if (data.hideCloseButton && (data.isConfirmed || data.autoHide)) {
            alertCloser.style.display = 'none';
            alertCloser.removeEventListener('click', hideAlertBox);
            reactivateCloseButton = true;
        }
    }

    initiate = function () {
        createOverlayFunc();
        createAlertBoxFunc();

        document.body.appendChild(overlayObj);
        document.body.appendChild(alertBox);
        window['manualAlert_createdAlertBox'] = alertBox;
        manualAlert_createdAlertBox.reInitiateFunc = reInitiate;
        manualAlert_createdAlertBox.getEngagedValue = function () {
            return engaged;
        }

        window.addEventListener('resize', finishAnimation);

        finishAnimation();
        userCustomizationFunc();
    }

    reInitiate = function (newMsg, newHeader, newData, changed) {
        if (msg != newMsg) {
            alertBody.innerHTML = newMsg;
            msg = newMsg;
        }

        if (header != newHeader) {
            alertTitle.innerHTML = newHeader;
            header = newHeader;
        }

        if (data.type != newData.type) {
            alertBox.classList.remove('panel-' + data.type);
            alertBox.classList.add('panel-' + newData.type);

            alertCloser.classList.remove('btn-' + data.type);
            alertCloser.classList.add('btn-' + newData.type);

            alertConfirmButton.className = "btn btn-" + (newData.type != "success" ? "danger" : "success");
        }

        if (data !== newData) {
            if (!newData.isConfirmed) {
                if (data.isConfirmed) alertConfirmButton.removeEventListener('click', data.isConfirmed);
                if (data.isRejected) alertRejectButton.removeEventListener('click', data.isRejected);
                alertFooter.hidden = true;
            } else {
                alertConfirmButton.removeEventListener('click', data.isConfirmed);
                alertConfirmButton.addEventListener('click', newData.isConfirmed);
                if (data.isRejected) alertRejectButton.removeEventListener('click', data.isRejected);
                if (newData.isConfirmed) alertRejectButton.addEventListener('click', newData.isRejected);
                alertFooter.hidden = false;
            }
        }

        data = newData;

        if (reactivateCloseButton) {
            alertCloser.addEventListener('click', hideAlertBox);
            alertCloser.style.removeProperty('display');
            reactivateCloseButton = false;
        }

        showAlertBox();
        finishAnimation();
        userCustomizationFunc();
    }

    initiate();
}

//includeAnimateCSS();

export default manualAlert;
