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
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { ConcatObserver } from "../observer/ConcatObserver";
import { registerClass } from "../definition/typescript/decorator/registerClass";
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
RepeatStream = __decorate([
    registerClass("RepeatStream")
], RepeatStream);
export { RepeatStream };
//# sourceMappingURL=RepeatStream.js.map