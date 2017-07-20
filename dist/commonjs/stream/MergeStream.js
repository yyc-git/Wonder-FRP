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
var GroupDisposable_1 = require("../Disposable/GroupDisposable");
var MergeObserver_1 = require("../observer/MergeObserver");
var registerClass_1 = require("../definition/typescript/decorator/registerClass");
var MergeStream = (function (_super) {
    __extends(MergeStream, _super);
    function MergeStream(source, maxConcurrent) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._maxConcurrent = null;
        _this._source = source;
        _this._maxConcurrent = maxConcurrent;
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    MergeStream.create = function (source, maxConcurrent) {
        var obj = new this(source, maxConcurrent);
        return obj;
    };
    MergeStream.prototype.subscribeCore = function (observer) {
        var streamGroup = Collection_1.Collection.create(), groupDisposable = GroupDisposable_1.GroupDisposable.create();
        this._source.buildStream(MergeObserver_1.MergeObserver.create(observer, this._maxConcurrent, streamGroup, groupDisposable));
        return groupDisposable;
    };
    MergeStream = __decorate([
        registerClass_1.registerClass("MergeStream")
    ], MergeStream);
    return MergeStream;
}(BaseStream_1.BaseStream));
exports.MergeStream = MergeStream;
//# sourceMappingURL=MergeStream.js.map