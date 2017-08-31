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
var SingleDisposable = (function (_super) {
    __extends(SingleDisposable, _super);
    function SingleDisposable(dispose) {
        var _this = _super.call(this, "SingleDisposable") || this;
        _this._disposable = null;
        _this._isDisposed = false;
        _this._disposable = dispose;
        return _this;
    }
    SingleDisposable.create = function (dispose) {
        if (dispose === void 0) { dispose = null; }
        var obj = new this(dispose);
        return obj;
    };
    SingleDisposable.prototype.setDispose = function (disposable) {
        this._disposable = disposable;
    };
    SingleDisposable.prototype.dispose = function () {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        if (!this._disposable) {
            return;
        }
        if (!!this._disposable.dispose) {
            this._disposable.dispose();
        }
        else {
            this._disposable();
        }
    };
    return SingleDisposable;
}(Entity));
export { SingleDisposable };
//# sourceMappingURL=SingleDisposable.js.map