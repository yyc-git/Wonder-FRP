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
var GroupDisposable_1 = require("../Disposable/GroupDisposable");
var DeferStream = (function (_super) {
    __extends(DeferStream, _super);
    function DeferStream(buildStreamFunc) {
        var _this = _super.call(this, null) || this;
        _this._buildStreamFunc = null;
        _this._buildStreamFunc = buildStreamFunc;
        return _this;
    }
    DeferStream.create = function (buildStreamFunc) {
        var obj = new this(buildStreamFunc);
        return obj;
    };
    DeferStream.prototype.subscribeCore = function (observer) {
        var group = GroupDisposable_1.GroupDisposable.create();
        group.add(this._buildStreamFunc().buildStream(observer));
        return group;
    };
    return DeferStream;
}(BaseStream_1.BaseStream));
exports.DeferStream = DeferStream;
//# sourceMappingURL=DeferStream.js.map