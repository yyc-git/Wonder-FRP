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
var Collection_1 = require("wonder-commonlib/dist/commonjs/Collection");
var JudgeUtils_1 = require("../JudgeUtils");
var Operator_1 = require("../global/Operator");
var GroupDisposable_1 = require("../Disposable/GroupDisposable");
var ConcatObserver_1 = require("../observer/ConcatObserver");
var registerClass_1 = require("../definition/typescript/decorator/registerClass");
var ConcatStream = (function (_super) {
    __extends(ConcatStream, _super);
    function ConcatStream(sources) {
        var _this = _super.call(this, null) || this;
        _this._sources = Collection_1.Collection.create();
        var self = _this;
        _this.scheduler = sources[0].scheduler;
        sources.forEach(function (source) {
            if (JudgeUtils_1.JudgeUtils.isPromise(source)) {
                self._sources.addChild(Operator_1.fromPromise(source));
            }
            else {
                self._sources.addChild(source);
            }
        });
        return _this;
    }
    ConcatStream.create = function (sources) {
        var obj = new this(sources);
        return obj;
    };
    ConcatStream.prototype.subscribeCore = function (observer) {
        var self = this, count = this._sources.getCount(), d = GroupDisposable_1.GroupDisposable.create();
        function loopRecursive(i) {
            if (i === count) {
                observer.completed();
                return;
            }
            d.add(self._sources.getChild(i).buildStream(ConcatObserver_1.ConcatObserver.create(observer, function () {
                loopRecursive(i + 1);
            })));
        }
        this.scheduler.publishRecursive(observer, 0, loopRecursive);
        return GroupDisposable_1.GroupDisposable.create(d);
    };
    return ConcatStream;
}(BaseStream_1.BaseStream));
ConcatStream = __decorate([
    registerClass_1.registerClass("ConcatStream")
], ConcatStream);
exports.ConcatStream = ConcatStream;
//# sourceMappingURL=ConcatStream.js.map