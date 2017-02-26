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
var FromEventPatternStream = (function (_super) {
    __extends(FromEventPatternStream, _super);
    function FromEventPatternStream(addHandler, removeHandler) {
        var _this = _super.call(this, null) || this;
        _this._addHandler = null;
        _this._removeHandler = null;
        _this._addHandler = addHandler;
        _this._removeHandler = removeHandler;
        return _this;
    }
    FromEventPatternStream.create = function (addHandler, removeHandler) {
        var obj = new this(addHandler, removeHandler);
        return obj;
    };
    FromEventPatternStream.prototype.subscribeCore = function (observer) {
        var self = this;
        function innerHandler(event) {
            observer.next(event);
        }
        this._addHandler(innerHandler);
        return SingleDisposable_1.SingleDisposable.create(function () {
            self._removeHandler(innerHandler);
        });
    };
    return FromEventPatternStream;
}(BaseStream_1.BaseStream));
exports.FromEventPatternStream = FromEventPatternStream;
//# sourceMappingURL=FromEventPatternStream.js.map