var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { BaseStream } from "./BaseStream";
import { JudgeUtils } from "../JudgeUtils";
import { fromPromise } from "../global/Operator";
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { SkipUntilOtherObserver } from "../observer/SkipUntilOtherObserver";
import { SkipUntilSourceObserver } from "../observer/SkipUntilSourceObserver";
var SkipUntilStream = (function (_super) {
    __extends(SkipUntilStream, _super);
    function SkipUntilStream(source, otherStream) {
        var _this = _super.call(this, null) || this;
        _this.isOpen = false;
        _this._source = null;
        _this._otherStream = null;
        _this._source = source;
        _this._otherStream = JudgeUtils.isPromise(otherStream) ? fromPromise(otherStream) : otherStream;
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    SkipUntilStream.create = function (source, otherSteam) {
        var obj = new this(source, otherSteam);
        return obj;
    };
    SkipUntilStream.prototype.subscribeCore = function (observer) {
        var group = GroupDisposable.create(), otherDisposable = null, skipUntilOtherObserver = null;
        group.add(this._source.buildStream(SkipUntilSourceObserver.create(observer, this)));
        skipUntilOtherObserver = SkipUntilOtherObserver.create(observer, this);
        otherDisposable = this._otherStream.buildStream(skipUntilOtherObserver);
        skipUntilOtherObserver.otherDisposable = otherDisposable;
        group.add(otherDisposable);
        return group;
    };
    return SkipUntilStream;
}(BaseStream));
export { SkipUntilStream };
//# sourceMappingURL=SkipUntilStream.js.map