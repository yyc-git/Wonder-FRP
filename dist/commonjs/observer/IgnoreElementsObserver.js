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
var IgnoreElementsObserver = (function (_super) {
    __extends(IgnoreElementsObserver, _super);
    function IgnoreElementsObserver(currentObserver) {
        var _this = _super.call(this, null, null, null) || this;
        _this._currentObserver = null;
        _this._currentObserver = currentObserver;
        return _this;
    }
    IgnoreElementsObserver.create = function (currentObserver) {
        return new this(currentObserver);
    };
    IgnoreElementsObserver.prototype.onNext = function (value) {
    };
    IgnoreElementsObserver.prototype.onError = function (error) {
        this._currentObserver.error(error);
    };
    IgnoreElementsObserver.prototype.onCompleted = function () {
        this._currentObserver.completed();
    };
    return IgnoreElementsObserver;
}(Observer_1.Observer));
exports.IgnoreElementsObserver = IgnoreElementsObserver;
//# sourceMappingURL=IgnoreElementsObserver.js.map