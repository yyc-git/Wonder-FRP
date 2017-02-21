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
import { Entity } from "../core/Entity";
import { SubjectObserver } from "../observer/SubjectObserver";
import { Observer } from "../core/Observer";
import { AutoDetachObserver } from "../observer/AutoDetachObserver";
import { InnerSubscription } from "../Disposable/InnerSubscription";
import { AnonymousStream } from "../stream/AnonymousStream";
import { SingleDisposable } from "../Disposable/SingleDisposable";
var GeneratorSubject = (function (_super) {
    __extends(GeneratorSubject, _super);
    function GeneratorSubject() {
        var _this = _super.call(this, "GeneratorSubject") || this;
        _this._isStart = false;
        _this.observer = new SubjectObserver();
        return _this;
    }
    GeneratorSubject.create = function () {
        var obj = new this();
        return obj;
    };
    Object.defineProperty(GeneratorSubject.prototype, "isStart", {
        get: function () {
            return this._isStart;
        },
        set: function (isStart) {
            this._isStart = isStart;
        },
        enumerable: true,
        configurable: true
    });
    GeneratorSubject.prototype.onBeforeNext = function (value) {
    };
    GeneratorSubject.prototype.onAfterNext = function (value) {
    };
    GeneratorSubject.prototype.onIsCompleted = function (value) {
        return false;
    };
    GeneratorSubject.prototype.onBeforeError = function (error) {
    };
    GeneratorSubject.prototype.onAfterError = function (error) {
    };
    GeneratorSubject.prototype.onBeforeCompleted = function () {
    };
    GeneratorSubject.prototype.onAfterCompleted = function () {
    };
    GeneratorSubject.prototype.subscribe = function (arg1, onError, onCompleted) {
        var observer = arg1 instanceof Observer
            ? arg1
            : AutoDetachObserver.create(arg1, onError, onCompleted);
        this.observer.addChild(observer);
        return InnerSubscription.create(this, observer);
    };
    GeneratorSubject.prototype.next = function (value) {
        if (!this._isStart || this.observer.isEmpty()) {
            return;
        }
        try {
            this.onBeforeNext(value);
            this.observer.next(value);
            this.onAfterNext(value);
            if (this.onIsCompleted(value)) {
                this.completed();
            }
        }
        catch (e) {
            this.error(e);
        }
    };
    GeneratorSubject.prototype.error = function (error) {
        if (!this._isStart || this.observer.isEmpty()) {
            return;
        }
        this.onBeforeError(error);
        this.observer.error(error);
        this.onAfterError(error);
    };
    GeneratorSubject.prototype.completed = function () {
        if (!this._isStart || this.observer.isEmpty()) {
            return;
        }
        this.onBeforeCompleted();
        this.observer.completed();
        this.onAfterCompleted();
    };
    GeneratorSubject.prototype.toStream = function () {
        var self = this, stream = null;
        stream = AnonymousStream.create(function (observer) {
            self.subscribe(observer);
        });
        return stream;
    };
    GeneratorSubject.prototype.start = function () {
        var self = this;
        this._isStart = true;
        this.observer.setDisposable(SingleDisposable.create(function () {
            self.dispose();
        }));
    };
    GeneratorSubject.prototype.stop = function () {
        this._isStart = false;
    };
    GeneratorSubject.prototype.remove = function (observer) {
        this.observer.removeChild(observer);
    };
    GeneratorSubject.prototype.dispose = function () {
        this.observer.dispose();
    };
    return GeneratorSubject;
}(Entity));
export { GeneratorSubject };
//# sourceMappingURL=GeneratorSubject.js.map