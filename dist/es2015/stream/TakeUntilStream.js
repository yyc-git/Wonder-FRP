var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { BaseStream } from "./BaseStream";
import { JudgeUtils } from "../JudgeUtils";
import { fromPromise } from "../global/Operator";
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { AutoDetachObserver } from "../observer/AutoDetachObserver";
import { TakeUntilObserver } from "../observer/TakeUntilObserver";
var TakeUntilStream = (function (_super) {
    __extends(TakeUntilStream, _super);
    function TakeUntilStream(source, otherStream) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._otherStream = null;
        _this._source = source;
        _this._otherStream = JudgeUtils.isPromise(otherStream) ? fromPromise(otherStream) : otherStream;
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    TakeUntilStream.create = function (source, otherSteam) {
        var obj = new this(source, otherSteam);
        return obj;
    };
    TakeUntilStream.prototype.subscribeCore = function (observer) {
        var group = GroupDisposable.create(), autoDetachObserver = AutoDetachObserver.create(observer), sourceDisposable = null;
        sourceDisposable = this._source.buildStream(observer);
        group.add(sourceDisposable);
        autoDetachObserver.setDisposable(sourceDisposable);
        group.add(this._otherStream.buildStream(TakeUntilObserver.create(autoDetachObserver)));
        return group;
    };
    return TakeUntilStream;
}(BaseStream));
export { TakeUntilStream };
//# sourceMappingURL=TakeUntilStream.js.map