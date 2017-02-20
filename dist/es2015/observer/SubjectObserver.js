import { Collection } from "wonder-commonlib/dist/es2015/Collection";
import { JudgeUtils } from "../JudgeUtils";
var SubjectObserver = (function () {
    function SubjectObserver() {
        this.observers = Collection.create();
        this._disposable = null;
    }
    SubjectObserver.prototype.isEmpty = function () {
        return this.observers.getCount() === 0;
    };
    SubjectObserver.prototype.next = function (value) {
        this.observers.forEach(function (ob) {
            ob.next(value);
        });
    };
    SubjectObserver.prototype.error = function (error) {
        this.observers.forEach(function (ob) {
            ob.error(error);
        });
    };
    SubjectObserver.prototype.completed = function () {
        this.observers.forEach(function (ob) {
            ob.completed();
        });
    };
    SubjectObserver.prototype.addChild = function (observer) {
        this.observers.addChild(observer);
        observer.setDisposable(this._disposable);
    };
    SubjectObserver.prototype.removeChild = function (observer) {
        this.observers.removeChild(function (ob) {
            return JudgeUtils.isEqual(ob, observer);
        });
    };
    SubjectObserver.prototype.dispose = function () {
        this.observers.forEach(function (ob) {
            ob.dispose();
        });
        this.observers.removeAllChildren();
    };
    SubjectObserver.prototype.setDisposable = function (disposable) {
        this.observers.forEach(function (observer) {
            observer.setDisposable(disposable);
        });
        this._disposable = disposable;
    };
    return SubjectObserver;
}());
export { SubjectObserver };
//# sourceMappingURL=SubjectObserver.js.map