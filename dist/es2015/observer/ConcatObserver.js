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
import { Observer } from "../core/Observer";
var ConcatObserver = (function (_super) {
    __extends(ConcatObserver, _super);
    function ConcatObserver(currentObserver, startNextStream) {
        var _this = _super.call(this, null, null, null) || this;
        _this.currentObserver = null;
        _this._startNextStream = null;
        _this.currentObserver = currentObserver;
        _this._startNextStream = startNextStream;
        return _this;
    }
    ConcatObserver.create = function (currentObserver, startNextStream) {
        return new this(currentObserver, startNextStream);
    };
    ConcatObserver.prototype.onNext = function (value) {
        this.currentObserver.next(value);
    };
    ConcatObserver.prototype.onError = function (error) {
        this.currentObserver.error(error);
    };
    ConcatObserver.prototype.onCompleted = function () {
        this._startNextStream();
    };
    return ConcatObserver;
}(Observer));
export { ConcatObserver };
//# sourceMappingURL=ConcatObserver.js.map