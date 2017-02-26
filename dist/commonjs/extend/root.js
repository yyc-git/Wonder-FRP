"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Variable_1 = require("../global/Variable");
Variable_1.root.requestNextAnimationFrame = (function () {
    var originalRequestAnimationFrame = undefined, wrapper = undefined, callback = undefined, geckoVersion = null, userAgent = Variable_1.root.navigator && Variable_1.root.navigator.userAgent, index = 0, self = this;
    wrapper = function (time) {
        time = Variable_1.root.performance.now();
        self.callback(time);
    };
    if (Variable_1.root.requestAnimationFrame) {
        return requestAnimationFrame;
    }
    if (Variable_1.root.webkitRequestAnimationFrame) {
        originalRequestAnimationFrame = Variable_1.root.webkitRequestAnimationFrame;
        Variable_1.root.webkitRequestAnimationFrame = function (callback, element) {
            self.callback = callback;
            return originalRequestAnimationFrame(wrapper, element);
        };
    }
    if (Variable_1.root.msRequestAnimationFrame) {
        originalRequestAnimationFrame = Variable_1.root.msRequestAnimationFrame;
        Variable_1.root.msRequestAnimationFrame = function (callback) {
            self.callback = callback;
            return originalRequestAnimationFrame(wrapper);
        };
    }
    if (Variable_1.root.mozRequestAnimationFrame) {
        index = userAgent.indexOf('rv:');
        if (userAgent.indexOf('Gecko') != -1) {
            geckoVersion = userAgent.substr(index + 3, 3);
            if (geckoVersion === '2.0') {
                Variable_1.root.mozRequestAnimationFrame = undefined;
            }
        }
    }
    return Variable_1.root.webkitRequestAnimationFrame ||
        Variable_1.root.mozRequestAnimationFrame ||
        Variable_1.root.oRequestAnimationFrame ||
        Variable_1.root.msRequestAnimationFrame ||
        function (callback, element) {
            var start, finish;
            Variable_1.root.setTimeout(function () {
                start = Variable_1.root.performance.now();
                callback(start);
                finish = Variable_1.root.performance.now();
                self.timeout = 1000 / 60 - (finish - start);
            }, self.timeout);
        };
}());
Variable_1.root.cancelNextRequestAnimationFrame = Variable_1.root.cancelRequestAnimationFrame
    || Variable_1.root.webkitCancelAnimationFrame
    || Variable_1.root.webkitCancelRequestAnimationFrame
    || Variable_1.root.mozCancelRequestAnimationFrame
    || Variable_1.root.oCancelRequestAnimationFrame
    || Variable_1.root.msCancelRequestAnimationFrame
    || clearTimeout;
//# sourceMappingURL=root.js.map