var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { FilterStream } from "./FilterStream";
import { FilterWithStateObserver } from "../observer/FilterWithStateObserver";
var FilterWithStateStream = (function (_super) {
    __extends(FilterWithStateStream, _super);
    function FilterWithStateStream() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterWithStateStream.create = function (source, predicate, thisArg) {
        var obj = new this(source, predicate, thisArg);
        return obj;
    };
    FilterWithStateStream.prototype.createObserver = function (observer) {
        return FilterWithStateObserver.create(observer, this.predicate, this);
    };
    FilterWithStateStream.prototype.createStreamForInternalFilter = function (source, innerPredicate, thisArg) {
        return FilterWithStateStream.create(source, innerPredicate, thisArg);
    };
    return FilterWithStateStream;
}(FilterStream));
export { FilterWithStateStream };
//# sourceMappingURL=FilterWithStateStream.js.map