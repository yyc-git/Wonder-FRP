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
import { Stream } from "../core/Stream";
import { Scheduler } from "../core/Scheduler";
import { Subject } from "../subject/Subject";
import { AutoDetachObserver } from "../observer/AutoDetachObserver";
import { JudgeUtils } from "../JudgeUtils";
import { SingleDisposable } from "../Disposable/SingleDisposable";
var AnonymousStream = (function (_super) {
    __extends(AnonymousStream, _super);
    function AnonymousStream(subscribeFunc) {
        var _this = _super.call(this, subscribeFunc) || this;
        _this.scheduler = Scheduler.create();
        return _this;
    }
    AnonymousStream.create = function (subscribeFunc) {
        var obj = new this(subscribeFunc);
        return obj;
    };
    AnonymousStream.prototype.buildStream = function (observer) {
        return SingleDisposable.create((this.subscribeFunc(observer) || function () { }));
    };
    AnonymousStream.prototype.subscribe = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var observer = null;
        if (args[0] instanceof Subject) {
            var subject = args[0];
            this.handleSubject(subject);
            return;
        }
        else if (JudgeUtils.isIObserver(args[0])) {
            observer = AutoDetachObserver.create(args[0]);
        }
        else {
            var onNext = args[0], onError = args[1] || null, onCompleted = args[2] || null;
            observer = AutoDetachObserver.create(onNext, onError, onCompleted);
        }
        observer.setDisposable(this.buildStream(observer));
        return observer;
    };
    return AnonymousStream;
}(Stream));
export { AnonymousStream };
//# sourceMappingURL=AnonymousStream.js.map