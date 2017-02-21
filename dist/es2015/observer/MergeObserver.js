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
import { Log } from "wonder-commonlib/dist/es2015/Log";
import { Observer } from "../core/Observer";
import { Stream } from "../core/Stream";
import { JudgeUtils } from "../JudgeUtils";
import { fromPromise } from "../global/Operator";
import { require, assert } from "../definition/typescript/decorator/contract";
var MergeObserver = (function (_super) {
    __extends(MergeObserver, _super);
    function MergeObserver(currentObserver, maxConcurrent, streamGroup, groupDisposable) {
        var _this = _super.call(this, null, null, null) || this;
        _this.done = false;
        _this.currentObserver = null;
        _this.activeCount = 0;
        _this.q = [];
        _this._maxConcurrent = null;
        _this._groupDisposable = null;
        _this._streamGroup = null;
        _this.currentObserver = currentObserver;
        _this._maxConcurrent = maxConcurrent;
        _this._streamGroup = streamGroup;
        _this._groupDisposable = groupDisposable;
        return _this;
    }
    MergeObserver.create = function (currentObserver, maxConcurrent, streamGroup, groupDisposable) {
        return new this(currentObserver, maxConcurrent, streamGroup, groupDisposable);
    };
    MergeObserver.prototype.handleSubscribe = function (innerSource) {
        if (JudgeUtils.isPromise(innerSource)) {
            innerSource = fromPromise(innerSource);
        }
        this._streamGroup.addChild(innerSource);
        this._groupDisposable.add(innerSource.buildStream(InnerObserver.create(this, this._streamGroup, innerSource)));
    };
    MergeObserver.prototype.onNext = function (innerSource) {
        if (this._isReachMaxConcurrent()) {
            this.activeCount++;
            this.handleSubscribe(innerSource);
            return;
        }
        this.q.push(innerSource);
    };
    MergeObserver.prototype.onError = function (error) {
        this.currentObserver.error(error);
    };
    MergeObserver.prototype.onCompleted = function () {
        this.done = true;
        if (this._streamGroup.getCount() === 0) {
            this.currentObserver.completed();
        }
    };
    MergeObserver.prototype._isReachMaxConcurrent = function () {
        return this.activeCount < this._maxConcurrent;
    };
    return MergeObserver;
}(Observer));
export { MergeObserver };
__decorate([
    require(function (innerSource) {
        assert(innerSource instanceof Stream || JudgeUtils.isPromise(innerSource), Log.info.FUNC_MUST_BE("innerSource", "Stream or Promise"));
    })
], MergeObserver.prototype, "onNext", null);
var InnerObserver = (function (_super) {
    __extends(InnerObserver, _super);
    function InnerObserver(parent, streamGroup, currentStream) {
        var _this = _super.call(this, null, null, null) || this;
        _this._parent = null;
        _this._streamGroup = null;
        _this._currentStream = null;
        _this._parent = parent;
        _this._streamGroup = streamGroup;
        _this._currentStream = currentStream;
        return _this;
    }
    InnerObserver.create = function (parent, streamGroup, currentStream) {
        var obj = new this(parent, streamGroup, currentStream);
        return obj;
    };
    InnerObserver.prototype.onNext = function (value) {
        this._parent.currentObserver.next(value);
    };
    InnerObserver.prototype.onError = function (error) {
        this._parent.currentObserver.error(error);
    };
    InnerObserver.prototype.onCompleted = function () {
        var parent = this._parent;
        this._streamGroup.removeChild(this._currentStream);
        if (parent.q.length > 0) {
            parent.activeCount = 0;
            parent.handleSubscribe(parent.q.shift());
        }
        else {
            if (this._isAsync() && this._streamGroup.getCount() === 0) {
                parent.currentObserver.completed();
            }
        }
    };
    InnerObserver.prototype._isAsync = function () {
        return this._parent.done;
    };
    return InnerObserver;
}(Observer));
//# sourceMappingURL=MergeObserver.js.map