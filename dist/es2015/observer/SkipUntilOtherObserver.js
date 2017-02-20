var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Observer } from "../core/Observer";
var SkipUntilOtherObserver = (function (_super) {
    __extends(SkipUntilOtherObserver, _super);
    function SkipUntilOtherObserver(prevObserver, skipUntilStream) {
        var _this = _super.call(this, null, null, null) || this;
        _this.otherDisposable = null;
        _this._prevObserver = null;
        _this._skipUntilStream = null;
        _this._prevObserver = prevObserver;
        _this._skipUntilStream = skipUntilStream;
        return _this;
    }
    SkipUntilOtherObserver.create = function (prevObserver, skipUntilStream) {
        return new this(prevObserver, skipUntilStream);
    };
    SkipUntilOtherObserver.prototype.onNext = function (value) {
        this._skipUntilStream.isOpen = true;
        this.otherDisposable.dispose();
    };
    SkipUntilOtherObserver.prototype.onError = function (error) {
        this._prevObserver.error(error);
    };
    SkipUntilOtherObserver.prototype.onCompleted = function () {
        this.otherDisposable.dispose();
    };
    return SkipUntilOtherObserver;
}(Observer));
export { SkipUntilOtherObserver };
//# sourceMappingURL=SkipUntilOtherObserver.js.map