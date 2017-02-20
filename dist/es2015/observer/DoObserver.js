var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Observer } from "../core/Observer";
var DoObserver = (function (_super) {
    __extends(DoObserver, _super);
    function DoObserver(currentObserver, prevObserver) {
        var _this = _super.call(this, null, null, null) || this;
        _this._currentObserver = null;
        _this._prevObserver = null;
        _this._currentObserver = currentObserver;
        _this._prevObserver = prevObserver;
        return _this;
    }
    DoObserver.create = function (currentObserver, prevObserver) {
        return new this(currentObserver, prevObserver);
    };
    DoObserver.prototype.onNext = function (value) {
        try {
            this._prevObserver.next(value);
        }
        catch (e) {
            this._prevObserver.error(e);
            this._currentObserver.error(e);
        }
        finally {
            this._currentObserver.next(value);
        }
    };
    DoObserver.prototype.onError = function (error) {
        try {
            this._prevObserver.error(error);
        }
        catch (e) {
        }
        finally {
            this._currentObserver.error(error);
        }
    };
    DoObserver.prototype.onCompleted = function () {
        try {
            this._prevObserver.completed();
        }
        catch (e) {
            this._prevObserver.error(e);
            this._currentObserver.error(e);
        }
        finally {
            this._currentObserver.completed();
        }
    };
    return DoObserver;
}(Observer));
export { DoObserver };
//# sourceMappingURL=DoObserver.js.map