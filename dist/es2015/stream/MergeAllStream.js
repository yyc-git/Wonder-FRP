var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { BaseStream } from "./BaseStream";
import { Collection } from "wonder-commonlib/dist/es2015/Collection";
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { MergeAllObserver } from "../observer/MergeAllObserver";
var MergeAllStream = (function (_super) {
    __extends(MergeAllStream, _super);
    function MergeAllStream(source) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._observer = null;
        _this._source = source;
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    MergeAllStream.create = function (source) {
        var obj = new this(source);
        return obj;
    };
    MergeAllStream.prototype.subscribeCore = function (observer) {
        var streamGroup = Collection.create(), groupDisposable = GroupDisposable.create();
        this._source.buildStream(MergeAllObserver.create(observer, streamGroup, groupDisposable));
        return groupDisposable;
    };
    return MergeAllStream;
}(BaseStream));
export { MergeAllStream };
//# sourceMappingURL=MergeAllStream.js.map