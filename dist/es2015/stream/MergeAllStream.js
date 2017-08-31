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
import { MergeAllObserver } from "../observer/MergeAllObserver";
import { registerClass } from "../definition/typescript/decorator/registerClass";
var MergeAllStream = (function (_super) {
    __extends(MergeAllStream, _super);
    function MergeAllStream(source) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._source = source;
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    MergeAllStream.create = function (source) {
        var obj = new this(source);
        return obj;
    };
    MergeAllStream.prototype.subscribeCore = function (observer) {
        var groupDisposable = GroupDisposable.create();
        groupDisposable.add(this._source.buildStream(MergeAllObserver.create(observer, groupDisposable)));
        return groupDisposable;
    };
    MergeAllStream = __decorate([
        registerClass("MergeAllStream")
    ], MergeAllStream);
    return MergeAllStream;
}(BaseStream));
export { MergeAllStream };
//# sourceMappingURL=MergeAllStream.js.map