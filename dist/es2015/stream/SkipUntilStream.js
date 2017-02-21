var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BaseStream } from "./BaseStream";
import { JudgeUtils } from "../JudgeUtils";
import { fromPromise } from "../global/Operator";
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { SkipUntilOtherObserver } from "../observer/SkipUntilOtherObserver";
import { SkipUntilSourceObserver } from "../observer/SkipUntilSourceObserver";
import { registerClass } from "../definition/typescript/decorator/registerClass";
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
SkipUntilStream = __decorate([
    registerClass("SkipUntilStream")
], SkipUntilStream);
export { SkipUntilStream };
//# sourceMappingURL=SkipUntilStream.js.map