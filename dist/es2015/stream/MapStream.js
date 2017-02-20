var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { BaseStream } from "./BaseStream";
import { MapObserver } from "../observer/MapObserver";
var MapStream = (function (_super) {
    __extends(MapStream, _super);
    function MapStream(source, selector) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._selector = null;
        _this._source = source;
        _this.scheduler = _this._source.scheduler;
        _this._selector = selector;
        return _this;
    }
    MapStream.create = function (source, selector) {
        var obj = new this(source, selector);
        return obj;
    };
    MapStream.prototype.subscribeCore = function (observer) {
        return this._source.buildStream(MapObserver.create(observer, this._selector));
    };
    return MapStream;
}(BaseStream));
export { MapStream };
//# sourceMappingURL=MapStream.js.map