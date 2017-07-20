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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var BaseStream_1 = require("./BaseStream");
var JudgeUtils_1 = require("../JudgeUtils");
var Operator_1 = require("../global/Operator");
var GroupDisposable_1 = require("../Disposable/GroupDisposable");
var SkipUntilOtherObserver_1 = require("../observer/SkipUntilOtherObserver");
var SkipUntilSourceObserver_1 = require("../observer/SkipUntilSourceObserver");
var registerClass_1 = require("../definition/typescript/decorator/registerClass");
var SkipUntilStream = (function (_super) {
    __extends(SkipUntilStream, _super);
    function SkipUntilStream(source, otherStream) {
        var _this = _super.call(this, null) || this;
        _this.isOpen = false;
        _this._source = null;
        _this._otherStream = null;
        _this._source = source;
        _this._otherStream = JudgeUtils_1.JudgeUtils.isPromise(otherStream) ? Operator_1.fromPromise(otherStream) : otherStream;
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    SkipUntilStream.create = function (source, otherSteam) {
        var obj = new this(source, otherSteam);
        return obj;
    };
    SkipUntilStream.prototype.subscribeCore = function (observer) {
        var group = GroupDisposable_1.GroupDisposable.create(), otherDisposable = null, skipUntilOtherObserver = null;
        group.add(this._source.buildStream(SkipUntilSourceObserver_1.SkipUntilSourceObserver.create(observer, this)));
        skipUntilOtherObserver = SkipUntilOtherObserver_1.SkipUntilOtherObserver.create(observer, this);
        otherDisposable = this._otherStream.buildStream(skipUntilOtherObserver);
        skipUntilOtherObserver.otherDisposable = otherDisposable;
        group.add(otherDisposable);
        return group;
    };
    SkipUntilStream = __decorate([
        registerClass_1.registerClass("SkipUntilStream")
    ], SkipUntilStream);
    return SkipUntilStream;
}(BaseStream_1.BaseStream));
exports.SkipUntilStream = SkipUntilStream;
//# sourceMappingURL=SkipUntilStream.js.map