var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { BaseStream } from "./BaseStream";
import { FunctionUtils } from "wonder-commonlib/dist/es2015/utils/FunctionUtils";
import { FilterObserver } from "../observer/FilterObserver";
var FilterStream = (function (_super) {
    __extends(FilterStream, _super);
    function FilterStream(source, predicate, thisArg) {
        var _this = _super.call(this, null) || this;
        _this.predicate = null;
        _this._source = null;
        _this._source = source;
        _this.predicate = FunctionUtils.bind(thisArg, predicate);
        return _this;
    }
    FilterStream.create = function (source, predicate, thisArg) {
        var obj = new this(source, predicate, thisArg);
        return obj;
    };
    FilterStream.prototype.subscribeCore = function (observer) {
        return this._source.subscribe(this.createObserver(observer));
    };
    FilterStream.prototype.internalFilter = function (predicate, thisArg) {
        return this.createStreamForInternalFilter(this._source, this._innerPredicate(predicate, this), thisArg);
    };
    FilterStream.prototype.createObserver = function (observer) {
        return FilterObserver.create(observer, this.predicate, this);
    };
    FilterStream.prototype.createStreamForInternalFilter = function (source, innerPredicate, thisArg) {
        return FilterStream.create(source, innerPredicate, thisArg);
    };
    FilterStream.prototype._innerPredicate = function (predicate, self) {
        var _this = this;
        return function (value, i, o) {
            return self.predicate(value, i, o) && predicate.call(_this, value, i, o);
        };
    };
    return FilterStream;
}(BaseStream));
export { FilterStream };
//# sourceMappingURL=FilterStream.js.map