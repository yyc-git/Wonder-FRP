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
var MapObserver_1 = require("../observer/MapObserver");
var registerClass_1 = require("../definition/typescript/decorator/registerClass");
var MapStream = (function (_super) {
    __extends(MapStream, _super);
    function MapStream(source, selector) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._selector = null;
        _this._source = source;
        _this.scheduler = _this._source.scheduler;
        _this._selector = selector;
        return _this;
    }
    MapStream.create = function (source, selector) {
        var obj = new this(source, selector);
        return obj;
    };
    MapStream.prototype.subscribeCore = function (observer) {
        return this._source.buildStream(MapObserver_1.MapObserver.create(observer, this._selector));
    };
    return MapStream;
}(BaseStream_1.BaseStream));
MapStream = __decorate([
    registerClass_1.registerClass("MapStream")
], MapStream);
exports.MapStream = MapStream;
//# sourceMappingURL=MapStream.js.map