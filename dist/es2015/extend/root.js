import { root } from "../global/Variable";
root.requestNextAnimationFrame = (function () {
    var originalRequestAnimationFrame = undefined, wrapper = undefined, callback = undefined, geckoVersion = null, userAgent = root.navigator && root.navigator.userAgent, index = 0, self = this;
    wrapper = function (time) {
        time = root.performance.now();
        self.callback(time);
    };
    if (root.requestAnimationFrame) {
        return requestAnimationFrame;
    }
    if (root.webkitRequestAnimationFrame) {
        originalRequestAnimationFrame = root.webkitRequestAnimationFrame;
        root.webkitRequestAnimationFrame = function (callback, element) {
            self.callback = callback;
            return originalRequestAnimationFrame(wrapper, element);
        };
    }
    if (root.msRequestAnimationFrame) {
        originalRequestAnimationFrame = root.msRequestAnimationFrame;
        root.msRequestAnimationFrame = function (callback) {
            self.callback = callback;
            return originalRequestAnimationFrame(wrapper);
        };
    }
    if (root.mozRequestAnimationFrame) {
        index = userAgent.indexOf('rv:');
        if (userAgent.indexOf('Gecko') != -1) {
            geckoVersion = userAgent.substr(index + 3, 3);
            if (geckoVersion === '2.0') {
                root.mozRequestAnimationFrame = undefined;
            }
        }
    }
    return root.webkitRequestAnimationFrame ||
        root.mozRequestAnimationFrame ||
        root.oRequestAnimationFrame ||
        root.msRequestAnimationFrame ||
        function (callback, element) {
            var start, finish;
            root.setTimeout(function () {
                start = root.performance.now();
                callback(start);
                finish = root.performance.now();
                self.timeout = 1000 / 60 - (finish - start);
            }, self.timeout);
        };
}());
root.cancelNextRequestAnimationFrame = root.cancelRequestAnimationFrame
    || root.webkitCancelAnimationFrame
    || root.webkitCancelRequestAnimationFrame
    || root.mozCancelRequestAnimationFrame
    || root.oCancelRequestAnimationFrame
    || root.msCancelRequestAnimationFrame
    || clearTimeout;
//# sourceMappingURL=root.js.map