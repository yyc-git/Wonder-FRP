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
import { AnonymousObserver } from "../observer/AnonymousObserver";
import { DoObserver } from "../observer/DoObserver";
import { registerClass } from "../definition/typescript/decorator/registerClass";
var DoStream = (function (_super) {
    __extends(DoStream, _super);
    function DoStream(source, onNext, onError, onCompleted) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._observer = null;
        _this._source = source;
        _this._observer = AnonymousObserver.create(onNext, onError, onCompleted);
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    DoStream.create = function (source, onNext, onError, onCompleted) {
        var obj = new this(source, onNext, onError, onCompleted);
        return obj;
    };
    DoStream.prototype.subscribeCore = function (observer) {
        return this._source.buildStream(DoObserver.create(observer, this._observer));
    };
    DoStream = __decorate([
        registerClass("DoStream")
    ], DoStream);
    return DoStream;
}(BaseStream));
export { DoStream };
//# sourceMappingURL=DoStream.js.map