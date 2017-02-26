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
var AnonymousObserver = (function (_super) {
    __extends(AnonymousObserver, _super);
    function AnonymousObserver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AnonymousObserver.create = function (onNext, onError, onCompleted) {
        return new this(onNext, onError, onCompleted);
    };
    AnonymousObserver.prototype.onNext = function (value) {
        this.onUserNext(value);
    };
    AnonymousObserver.prototype.onError = function (error) {
        this.onUserError(error);
    };
    AnonymousObserver.prototype.onCompleted = function () {
        this.onUserCompleted();
    };
    return AnonymousObserver;
}(Observer_1.Observer));
exports.AnonymousObserver = AnonymousObserver;
//# sourceMappingURL=AnonymousObserver.js.map