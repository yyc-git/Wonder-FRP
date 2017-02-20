var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { BaseStream } from "./BaseStream";
import { IgnoreElementsObserver } from "../observer/IgnoreElementsObserver";
var IgnoreElementsStream = (function (_super) {
    __extends(IgnoreElementsStream, _super);
    function IgnoreElementsStream(source) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._source = source;
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    IgnoreElementsStream.create = function (source) {
        var obj = new this(source);
        return obj;
    };
    IgnoreElementsStream.prototype.subscribeCore = function (observer) {
        return this._source.buildStream(IgnoreElementsObserver.create(observer));
    };
    return IgnoreElementsStream;
}(BaseStream));
export { IgnoreElementsStream };
//# sourceMappingURL=IgnoreElementsStream.js.map