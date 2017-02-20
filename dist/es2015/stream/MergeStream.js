var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { BaseStream } from "./BaseStream";
import { Collection } from "wonder-commonlib/dist/es2015/Collection";
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { MergeObserver } from "../observer/MergeObserver";
var MergeStream = (function (_super) {
    __extends(MergeStream, _super);
    function MergeStream(source, maxConcurrent) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._maxConcurrent = null;
        _this._source = source;
        _this._maxConcurrent = maxConcurrent;
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    MergeStream.create = function (source, maxConcurrent) {
        var obj = new this(source, maxConcurrent);
        return obj;
    };
    MergeStream.prototype.subscribeCore = function (observer) {
        var streamGroup = Collection.create(), groupDisposable = GroupDisposable.create();
        this._source.buildStream(MergeObserver.create(observer, this._maxConcurrent, streamGroup, groupDisposable));
        return groupDisposable;
    };
    return MergeStream;
}(BaseStream));
export { MergeStream };
//# sourceMappingURL=MergeStream.js.map