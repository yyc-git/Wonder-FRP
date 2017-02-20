var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { BaseStream } from "./BaseStream";
import { AnonymousObserver } from "../observer/AnonymousObserver";
import { DoObserver } from "../observer/DoObserver";
var DoStream = (function (_super) {
    __extends(DoStream, _super);
    function DoStream(source, onNext, onError, onCompleted) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._observer = null;
        _this._source = source;
        _this._observer = AnonymousObserver.create(onNext, onError, onCompleted);
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    DoStream.create = function (source, onNext, onError, onCompleted) {
        var obj = new this(source, onNext, onError, onCompleted);
        return obj;
    };
    DoStream.prototype.subscribeCore = function (observer) {
        return this._source.buildStream(DoObserver.create(observer, this._observer));
    };
    return DoStream;
}(BaseStream));
export { DoStream };
//# sourceMappingURL=DoStream.js.map