var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Observer } from "../core/Observer";
var SkipUntilSourceObserver = (function (_super) {
    __extends(SkipUntilSourceObserver, _super);
    function SkipUntilSourceObserver(prevObserver, skipUntilStream) {
        var _this = _super.call(this, null, null, null) || this;
        _this._prevObserver = null;
        _this._skipUntilStream = null;
        _this._prevObserver = prevObserver;
        _this._skipUntilStream = skipUntilStream;
        return _this;
    }
    SkipUntilSourceObserver.create = function (prevObserver, skipUntilStream) {
        return new this(prevObserver, skipUntilStream);
    };
    SkipUntilSourceObserver.prototype.onNext = function (value) {
        if (this._skipUntilStream.isOpen) {
            this._prevObserver.next(value);
        }
    };
    SkipUntilSourceObserver.prototype.onError = function (error) {
        this._prevObserver.error(error);
    };
    SkipUntilSourceObserver.prototype.onCompleted = function () {
        if (this._skipUntilStream.isOpen) {
            this._prevObserver.completed();
        }
    };
    return SkipUntilSourceObserver;
}(Observer));
export { SkipUntilSourceObserver };
//# sourceMappingURL=SkipUntilSourceObserver.js.map