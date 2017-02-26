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
var FromPromiseStream = (function (_super) {
    __extends(FromPromiseStream, _super);
    function FromPromiseStream(promise, scheduler) {
        var _this = _super.call(this, null) || this;
        _this._promise = null;
        _this._promise = promise;
        _this.scheduler = scheduler;
        return _this;
    }
    FromPromiseStream.create = function (promise, scheduler) {
        var obj = new this(promise, scheduler);
        return obj;
    };
    FromPromiseStream.prototype.subscribeCore = function (observer) {
        this._promise.then(function (data) {
            observer.next(data);
            observer.completed();
        }, function (err) {
            observer.error(err);
        }, observer);
        return SingleDisposable_1.SingleDisposable.create();
    };
    return FromPromiseStream;
}(BaseStream_1.BaseStream));
exports.FromPromiseStream = FromPromiseStream;
//# sourceMappingURL=FromPromiseStream.js.map