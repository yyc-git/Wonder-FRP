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
var IntervalStream = (function (_super) {
    __extends(IntervalStream, _super);
    function IntervalStream(interval, scheduler) {
        var _this = _super.call(this, null) || this;
        _this._interval = null;
        _this._interval = interval;
        _this.scheduler = scheduler;
        return _this;
    }
    IntervalStream.create = function (interval, scheduler) {
        var obj = new this(interval, scheduler);
        obj.initWhenCreate();
        return obj;
    };
    IntervalStream.prototype.initWhenCreate = function () {
        this._interval = this._interval <= 0 ? 1 : this._interval;
    };
    IntervalStream.prototype.subscribeCore = function (observer) {
        var self = this, id = null;
        id = this.scheduler.publishInterval(observer, 0, this._interval, function (count) {
            observer.next(count);
            return count + 1;
        });
        return SingleDisposable_1.SingleDisposable.create(function () {
            Variable_1.root.clearInterval(id);
        });
    };
    return IntervalStream;
}(BaseStream_1.BaseStream));
exports.IntervalStream = IntervalStream;
//# sourceMappingURL=IntervalStream.js.map