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
var Stream_1 = require("../core/Stream");
var Observer_1 = require("../core/Observer");
var AutoDetachObserver_1 = require("../observer/AutoDetachObserver");
var BaseStream = (function (_super) {
    __extends(BaseStream, _super);
    function BaseStream() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BaseStream.prototype.subscribe = function (arg1, onError, onCompleted) {
        var observer = null;
        if (this.handleSubject(arg1)) {
            return;
        }
        observer = arg1 instanceof Observer_1.Observer
            ? AutoDetachObserver_1.AutoDetachObserver.create(arg1)
            : AutoDetachObserver_1.AutoDetachObserver.create(arg1, onError, onCompleted);
        observer.setDisposable(this.buildStream(observer));
        return observer;
    };
    BaseStream.prototype.buildStream = function (observer) {
        _super.prototype.buildStream.call(this, observer);
        return this.subscribeCore(observer);
    };
    return BaseStream;
}(Stream_1.Stream));
exports.BaseStream = BaseStream;
//# sourceMappingURL=BaseStream.js.map