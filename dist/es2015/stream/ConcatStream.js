var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { BaseStream } from "./BaseStream";
import { Collection } from "wonder-commonlib/dist/es2015/Collection";
import { JudgeUtils } from "../JudgeUtils";
import { fromPromise } from "../global/Operator";
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { ConcatObserver } from "../observer/ConcatObserver";
var ConcatStream = (function (_super) {
    __extends(ConcatStream, _super);
    function ConcatStream(sources) {
        var _this = _super.call(this, null) || this;
        _this._sources = Collection.create();
        var self = _this;
        _this.scheduler = sources[0].scheduler;
        sources.forEach(function (source) {
            if (JudgeUtils.isPromise(source)) {
                self._sources.addChild(fromPromise(source));
            }
            else {
                self._sources.addChild(source);
            }
        });
        return _this;
    }
    ConcatStream.create = function (sources) {
        var obj = new this(sources);
        return obj;
    };
    ConcatStream.prototype.subscribeCore = function (observer) {
        var self = this, count = this._sources.getCount(), d = GroupDisposable.create();
        function loopRecursive(i) {
            if (i === count) {
                observer.completed();
                return;
            }
            d.add(self._sources.getChild(i).buildStream(ConcatObserver.create(observer, function () {
                loopRecursive(i + 1);
            })));
        }
        this.scheduler.publishRecursive(observer, 0, loopRecursive);
        return GroupDisposable.create(d);
    };
    return ConcatStream;
}(BaseStream));
export { ConcatStream };
//# sourceMappingURL=ConcatStream.js.map