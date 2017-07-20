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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { FilterStream } from "./FilterStream";
import { FilterWithStateObserver } from "../observer/FilterWithStateObserver";
import { registerClass } from "../definition/typescript/decorator/registerClass";
var FilterWithStateStream = (function (_super) {
    __extends(FilterWithStateStream, _super);
    function FilterWithStateStream() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterWithStateStream_1 = FilterWithStateStream;
    FilterWithStateStream.create = function (source, predicate, thisArg) {
        var obj = new this(source, predicate, thisArg);
        return obj;
    };
    FilterWithStateStream.prototype.createObserver = function (observer) {
        return FilterWithStateObserver.create(observer, this.predicate, this);
    };
    FilterWithStateStream.prototype.createStreamForInternalFilter = function (source, innerPredicate, thisArg) {
        return FilterWithStateStream_1.create(source, innerPredicate, thisArg);
    };
    FilterWithStateStream = FilterWithStateStream_1 = __decorate([
        registerClass("FilterWithStateStream")
    ], FilterWithStateStream);
    return FilterWithStateStream;
    var FilterWithStateStream_1;
}(FilterStream));
export { FilterWithStateStream };
//# sourceMappingURL=FilterWithStateStream.js.map