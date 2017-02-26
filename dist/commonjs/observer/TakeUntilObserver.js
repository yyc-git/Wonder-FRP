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
var Observer_1 = require("../core/Observer");
var TakeUntilObserver = (function (_super) {
    __extends(TakeUntilObserver, _super);
    function TakeUntilObserver(prevObserver) {
        var _this = _super.call(this, null, null, null) || this;
        _this._prevObserver = null;
        _this._prevObserver = prevObserver;
        return _this;
    }
    TakeUntilObserver.create = function (prevObserver) {
        return new this(prevObserver);
    };
    TakeUntilObserver.prototype.onNext = function (value) {
        this._prevObserver.completed();
    };
    TakeUntilObserver.prototype.onError = function (error) {
        this._prevObserver.error(error);
    };
    TakeUntilObserver.prototype.onCompleted = function () {
    };
    return TakeUntilObserver;
}(Observer_1.Observer));
exports.TakeUntilObserver = TakeUntilObserver;
//# sourceMappingURL=TakeUntilObserver.js.map