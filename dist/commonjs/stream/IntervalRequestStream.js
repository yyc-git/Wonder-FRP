"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BaseStream_1 = require("./BaseStream");
var SingleDisposable_1 = require("../Disposable/SingleDisposable");
var Variable_1 = require("../global/Variable");
var IntervalRequestStream = (function (_super) {
    __extends(IntervalRequestStream, _super);
    function IntervalRequestStream(scheduler) {
        var _this = _super.call(this, null) || this;
        _this._isEnd = false;
        _this.scheduler = scheduler;
        return _this;
    }
    IntervalRequestStream.create = function (scheduler) {
        var obj = new this(scheduler);
        return obj;
    };
    IntervalRequestStream.prototype.subscribeCore = function (observer) {
        var self = this;
        this.scheduler.publishIntervalRequest(observer, function (time) {
            observer.next(time);
            return self._isEnd;
        });
        return SingleDisposable_1.SingleDisposable.create(function () {
            Variable_1.root.cancelNextRequestAnimationFrame(self.scheduler.requestLoopId);
            self._isEnd = true;
        });
    };
    return IntervalRequestStream;
}(BaseStream_1.BaseStream));
exports.IntervalRequestStream = IntervalRequestStream;
//# sourceMappingURL=IntervalRequestStream.js.map