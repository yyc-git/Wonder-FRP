var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Observer } from "../core/Observer";
var FilterObserver = (function (_super) {
    __extends(FilterObserver, _super);
    function FilterObserver(prevObserver, predicate, source) {
        var _this = _super.call(this, null, null, null) || this;
        _this.prevObserver = null;
        _this.source = null;
        _this.i = 0;
        _this.predicate = null;
        _this.prevObserver = prevObserver;
        _this.predicate = predicate;
        _this.source = source;
        return _this;
    }
    FilterObserver.create = function (prevObserver, predicate, source) {
        return new this(prevObserver, predicate, source);
    };
    FilterObserver.prototype.onNext = function (value) {
        try {
            if (this.predicate(value, this.i++, this.source)) {
                this.prevObserver.next(value);
            }
        }
        catch (e) {
            this.prevObserver.error(e);
        }
    };
    FilterObserver.prototype.onError = function (error) {
        this.prevObserver.error(error);
    };
    FilterObserver.prototype.onCompleted = function () {
        this.prevObserver.completed();
    };
    return FilterObserver;
}(Observer));
export { FilterObserver };
//# sourceMappingURL=FilterObserver.js.map