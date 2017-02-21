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
    function SingleDisposable(disposeHandler) {
        var _this = _super.call(this, "SingleDisposable") || this;
        _this._disposeHandler = null;
        _this._isDisposed = false;
        _this._disposeHandler = disposeHandler;
        return _this;
    }
    SingleDisposable.create = function (disposeHandler) {
        if (disposeHandler === void 0) { disposeHandler = function () { }; }
        var obj = new this(disposeHandler);
        return obj;
    };
    SingleDisposable.prototype.setDisposeHandler = function (handler) {
        this._disposeHandler = handler;
    };
    SingleDisposable.prototype.dispose = function () {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._disposeHandler();
    };
    return SingleDisposable;
}(Entity));
export { SingleDisposable };
//# sourceMappingURL=SingleDisposable.js.map