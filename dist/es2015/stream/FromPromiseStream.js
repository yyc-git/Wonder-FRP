var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { BaseStream } from "./BaseStream";
import { SingleDisposable } from "../Disposable/SingleDisposable";
var FromPromiseStream = (function (_super) {
    __extends(FromPromiseStream, _super);
    function FromPromiseStream(promise, scheduler) {
        var _this = _super.call(this, null) || this;
        _this._promise = null;
        _this._promise = promise;
        _this.scheduler = scheduler;
        return _this;
    }
    FromPromiseStream.create = function (promise, scheduler) {
        var obj = new this(promise, scheduler);
        return obj;
    };
    FromPromiseStream.prototype.subscribeCore = function (observer) {
        this._promise.then(function (data) {
            observer.next(data);
            observer.completed();
        }, function (err) {
            observer.error(err);
        }, observer);
        return SingleDisposable.create();
    };
    return FromPromiseStream;
}(BaseStream));
export { FromPromiseStream };
//# sourceMappingURL=FromPromiseStream.js.map