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
var Scheduler_1 = require("../core/Scheduler");
var Subject_1 = require("../subject/Subject");
var AutoDetachObserver_1 = require("../observer/AutoDetachObserver");
var JudgeUtils_1 = require("../JudgeUtils");
var SingleDisposable_1 = require("../Disposable/SingleDisposable");
var AnonymousStream = (function (_super) {
    __extends(AnonymousStream, _super);
    function AnonymousStream(subscribeFunc) {
        var _this = _super.call(this, subscribeFunc) || this;
        _this.scheduler = Scheduler_1.Scheduler.create();
        return _this;
    }
    AnonymousStream.create = function (subscribeFunc) {
        var obj = new this(subscribeFunc);
        return obj;
    };
    AnonymousStream.prototype.buildStream = function (observer) {
        return SingleDisposable_1.SingleDisposable.create((this.subscribeFunc(observer) || function () { }));
    };
    AnonymousStream.prototype.subscribe = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var observer = null;
        if (args[0] instanceof Subject_1.Subject) {
            var subject = args[0];
            this.handleSubject(subject);
            return;
        }
        else if (JudgeUtils_1.JudgeUtils.isIObserver(args[0])) {
            observer = AutoDetachObserver_1.AutoDetachObserver.create(args[0]);
        }
        else {
            var onNext = args[0], onError = args[1] || null, onCompleted = args[2] || null;
            observer = AutoDetachObserver_1.AutoDetachObserver.create(onNext, onError, onCompleted);
        }
        observer.setDisposable(this.buildStream(observer));
        return observer;
    };
    return AnonymousStream;
}(Stream_1.Stream));
exports.AnonymousStream = AnonymousStream;
//# sourceMappingURL=AnonymousStream.js.map