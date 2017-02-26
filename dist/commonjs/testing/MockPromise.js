"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MockPromise = (function () {
    function MockPromise(scheduler, messages) {
        this._messages = [];
        this._scheduler = null;
        this._scheduler = scheduler;
        this._messages = messages;
    }
    MockPromise.create = function (scheduler, messages) {
        var obj = new this(scheduler, messages);
        return obj;
    };
    MockPromise.prototype.then = function (successCb, errorCb, observer) {
        this._scheduler.setStreamMap(observer, this._messages);
    };
    return MockPromise;
}());
exports.MockPromise = MockPromise;
//# sourceMappingURL=MockPromise.js.map