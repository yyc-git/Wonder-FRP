var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Log } from "wonder-commonlib/dist/es2015/Log";
import { BaseStream } from "./BaseStream";
import { require, assert } from "../definition/typescript/decorator/contract";
import { SingleDisposable } from "../Disposable/SingleDisposable";
import { root } from "../global/Variable";
var TimeoutStream = (function (_super) {
    __extends(TimeoutStream, _super);
    function TimeoutStream(time, scheduler) {
        var _this = _super.call(this, null) || this;
        _this._time = null;
        _this._time = time;
        _this.scheduler = scheduler;
        return _this;
    }
    TimeoutStream.create = function (time, scheduler) {
        var obj = new this(time, scheduler);
        return obj;
    };
    TimeoutStream.prototype.subscribeCore = function (observer) {
        var id = null;
        id = this.scheduler.publishTimeout(observer, this._time, function (time) {
            observer.next(time);
        });
        return SingleDisposable.create(function () {
            root.clearTimeout(id);
        });
    };
    return TimeoutStream;
}(BaseStream));
export { TimeoutStream };
__decorate([
    require(function (time, scheduler) {
        assert(time > 0, Log.info.FUNC_SHOULD("time", "> 0"));
    })
], TimeoutStream, "create", null);
//# sourceMappingURL=TimeoutStream.js.map