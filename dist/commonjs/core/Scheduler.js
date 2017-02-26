"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Variable_1 = require("../global/Variable");
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
        return Variable_1.root.setInterval(function () {
            initial = action(initial);
        }, interval);
    };
    Scheduler.prototype.publishIntervalRequest = function (observer, action) {
        var self = this, loop = function (time) {
            var isEnd = action(time);
            if (isEnd) {
                return;
            }
            self._requestLoopId = Variable_1.root.requestNextAnimationFrame(loop);
        };
        this._requestLoopId = Variable_1.root.requestNextAnimationFrame(loop);
    };
    Scheduler.prototype.publishTimeout = function (observer, time, action) {
        return Variable_1.root.setTimeout(function () {
            action(time);
            observer.completed();
        }, time);
    };
    return Scheduler;
}());
exports.Scheduler = Scheduler;
//# sourceMappingURL=Scheduler.js.map