var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Observer } from "../core/Observer";
var AnonymousObserver = (function (_super) {
    __extends(AnonymousObserver, _super);
    function AnonymousObserver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AnonymousObserver.create = function (onNext, onError, onCompleted) {
        return new this(onNext, onError, onCompleted);
    };
    AnonymousObserver.prototype.onNext = function (value) {
        this.onUserNext(value);
    };
    AnonymousObserver.prototype.onError = function (error) {
        this.onUserError(error);
    };
    AnonymousObserver.prototype.onCompleted = function () {
        this.onUserCompleted();
    };
    return AnonymousObserver;
}(Observer));
export { AnonymousObserver };
//# sourceMappingURL=AnonymousObserver.js.map