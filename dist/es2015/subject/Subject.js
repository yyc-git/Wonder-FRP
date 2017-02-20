import { SubjectObserver } from "../observer/SubjectObserver";
import { Observer } from "../core/Observer";
import { AutoDetachObserver } from "../observer/AutoDetachObserver";
import { InnerSubscription } from "../Disposable/InnerSubscription";
var Subject = (function () {
    function Subject() {
        this._source = null;
        this._observer = new SubjectObserver();
    }
    Subject.create = function () {
        var obj = new this();
        return obj;
    };
    Object.defineProperty(Subject.prototype, "source", {
        get: function () {
            return this._source;
        },
        set: function (source) {
            this._source = source;
        },
        enumerable: true,
        configurable: true
    });
    Subject.prototype.subscribe = function (arg1, onError, onCompleted) {
        var observer = arg1 instanceof Observer
            ? arg1
            : AutoDetachObserver.create(arg1, onError, onCompleted);
        this._observer.addChild(observer);
        return InnerSubscription.create(this, observer);
    };
    Subject.prototype.next = function (value) {
        this._observer.next(value);
    };
    Subject.prototype.error = function (error) {
        this._observer.error(error);
    };
    Subject.prototype.completed = function () {
        this._observer.completed();
    };
    Subject.prototype.start = function () {
        if (!this._source) {
            return;
        }
        this._observer.setDisposable(this._source.buildStream(this));
    };
    Subject.prototype.remove = function (observer) {
        this._observer.removeChild(observer);
    };
    Subject.prototype.dispose = function () {
        this._observer.dispose();
    };
    return Subject;
}());
export { Subject };
//# sourceMappingURL=Subject.js.map