var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Entity } from "./Entity";
var Observer = (function (_super) {
    __extends(Observer, _super);
    function Observer() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = _super.call(this, "Observer") || this;
        _this._isDisposed = null;
        _this.onUserNext = null;
        _this.onUserError = null;
        _this.onUserCompleted = null;
        _this._isStop = false;
        _this._disposable = null;
        if (args.length === 1) {
            var observer_1 = args[0];
            _this.onUserNext = function (v) {
                observer_1.next(v);
            };
            _this.onUserError = function (e) {
                observer_1.error(e);
            };
            _this.onUserCompleted = function () {
                observer_1.completed();
            };
        }
        else {
            var onNext = args[0], onError = args[1], onCompleted = args[2];
            _this.onUserNext = onNext || function (v) { };
            _this.onUserError = onError || function (e) {
                throw e;
            };
            _this.onUserCompleted = onCompleted || function () { };
        }
        return _this;
    }
    Object.defineProperty(Observer.prototype, "isDisposed", {
        get: function () {
            return this._isDisposed;
        },
        set: function (isDisposed) {
            this._isDisposed = isDisposed;
        },
        enumerable: true,
        configurable: true
    });
    Observer.prototype.next = function (value) {
        if (!this._isStop) {
            return this.onNext(value);
        }
    };
    Observer.prototype.error = function (error) {
        if (!this._isStop) {
            this._isStop = true;
            this.onError(error);
        }
    };
    Observer.prototype.completed = function () {
        if (!this._isStop) {
            this._isStop = true;
            this.onCompleted();
        }
    };
    Observer.prototype.dispose = function () {
        this._isStop = true;
        this._isDisposed = true;
        if (this._disposable) {
            this._disposable.dispose();
        }
    };
    Observer.prototype.setDisposable = function (disposable) {
        this._disposable = disposable;
    };
    return Observer;
}(Entity));
export { Observer };
//# sourceMappingURL=Observer.js.map