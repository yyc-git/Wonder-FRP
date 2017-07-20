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
var FunctionUtils_1 = require("wonder-commonlib/dist/commonjs/utils/FunctionUtils");
var FilterObserver_1 = require("../observer/FilterObserver");
var registerClass_1 = require("../definition/typescript/decorator/registerClass");
var FilterStream = (function (_super) {
    __extends(FilterStream, _super);
    function FilterStream(source, predicate, thisArg) {
        var _this = _super.call(this, null) || this;
        _this.predicate = null;
        _this._source = null;
        _this._source = source;
        _this.predicate = FunctionUtils_1.FunctionUtils.bind(thisArg, predicate);
        return _this;
    }
    FilterStream_1 = FilterStream;
    FilterStream.create = function (source, predicate, thisArg) {
        var obj = new this(source, predicate, thisArg);
        return obj;
    };
    FilterStream.prototype.subscribeCore = function (observer) {
        return this._source.subscribe(this.createObserver(observer));
    };
    FilterStream.prototype.internalFilter = function (predicate, thisArg) {
        return this.createStreamForInternalFilter(this._source, this._innerPredicate(predicate, this), thisArg);
    };
    FilterStream.prototype.createObserver = function (observer) {
        return FilterObserver_1.FilterObserver.create(observer, this.predicate, this);
    };
    FilterStream.prototype.createStreamForInternalFilter = function (source, innerPredicate, thisArg) {
        return FilterStream_1.create(source, innerPredicate, thisArg);
    };
    FilterStream.prototype._innerPredicate = function (predicate, self) {
        var _this = this;
        return function (value, i, o) {
            return self.predicate(value, i, o) && predicate.call(_this, value, i, o);
        };
    };
    FilterStream = FilterStream_1 = __decorate([
        registerClass_1.registerClass("FilterStream")
    ], FilterStream);
    return FilterStream;
    var FilterStream_1;
}(BaseStream_1.BaseStream));
exports.FilterStream = FilterStream;
//# sourceMappingURL=FilterStream.js.map