var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { BaseStream } from "./BaseStream";
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { ConcatObserver } from "../observer/ConcatObserver";
var RepeatStream = (function (_super) {
    __extends(RepeatStream, _super);
    function RepeatStream(source, count) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._count = null;
        _this._source = source;
        _this._count = count;
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    RepeatStream.create = function (source, count) {
        var obj = new this(source, count);
        return obj;
    };
    RepeatStream.prototype.subscribeCore = function (observer) {
        var self = this, d = GroupDisposable.create();
        function loopRecursive(count) {
            if (count === 0) {
                observer.completed();
                return;
            }
            d.add(self._source.buildStream(ConcatObserver.create(observer, function () {
                loopRecursive(count - 1);
            })));
        }
        this.scheduler.publishRecursive(observer, this._count, loopRecursive);
        return GroupDisposable.create(d);
    };
    return RepeatStream;
}(BaseStream));
export { RepeatStream };
//# sourceMappingURL=RepeatStream.js.map