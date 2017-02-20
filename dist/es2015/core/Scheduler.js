import { root } from "../global/Variable";
var Scheduler = (function () {
    function Scheduler() {
        this._requestLoopId = null;
    }
    Scheduler.create = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var obj = new this();
        return obj;
    };
    Object.defineProperty(Scheduler.prototype, "requestLoopId", {
        get: function () {
            return this._requestLoopId;
        },
        set: function (requestLoopId) {
            this._requestLoopId = requestLoopId;
        },
        enumerable: true,
        configurable: true
    });
    Scheduler.prototype.publishRecursive = function (observer, initial, action) {
        action(initial);
    };
    Scheduler.prototype.publishInterval = function (observer, initial, interval, action) {
        return root.setInterval(function () {
            initial = action(initial);
        }, interval);
    };
    Scheduler.prototype.publishIntervalRequest = function (observer, action) {
        var self = this, loop = function (time) {
            var isEnd = action(time);
            if (isEnd) {
                return;
            }
            self._requestLoopId = root.requestNextAnimationFrame(loop);
        };
        this._requestLoopId = root.requestNextAnimationFrame(loop);
    };
    Scheduler.prototype.publishTimeout = function (observer, time, action) {
        return root.setTimeout(function () {
            action(time);
            observer.completed();
        }, time);
    };
    return Scheduler;
}());
export { Scheduler };
//# sourceMappingURL=Scheduler.js.map