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
var MapObserver = (function (_super) {
    __extends(MapObserver, _super);
    function MapObserver(currentObserver, selector) {
        var _this = _super.call(this, null, null, null) || this;
        _this._currentObserver = null;
        _this._selector = null;
        _this._currentObserver = currentObserver;
        _this._selector = selector;
        return _this;
    }
    MapObserver.create = function (currentObserver, selector) {
        return new this(currentObserver, selector);
    };
    MapObserver.prototype.onNext = function (value) {
        var result = null;
        try {
            result = this._selector(value);
        }
        catch (e) {
            this._currentObserver.error(e);
        }
        finally {
            this._currentObserver.next(result);
        }
    };
    MapObserver.prototype.onError = function (error) {
        this._currentObserver.error(error);
    };
    MapObserver.prototype.onCompleted = function () {
        this._currentObserver.completed();
    };
    return MapObserver;
}(Observer));
export { MapObserver };
//# sourceMappingURL=MapObserver.js.map