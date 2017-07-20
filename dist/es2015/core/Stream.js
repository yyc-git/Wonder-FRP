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
import { Entity } from "./Entity";
import { Subject } from "../subject/Subject";
import { SingleDisposable } from "../Disposable/SingleDisposable";
import { ClassMapUtils } from "../utils/ClassMapUtils";
import { requireCheck, assert } from "../definition/typescript/decorator/contract";
import { FunctionUtils } from "wonder-commonlib/dist/es2015/utils/FunctionUtils";
import { JudgeUtils } from "../JudgeUtils";
var Stream = (function (_super) {
    __extends(Stream, _super);
    function Stream(subscribeFunc) {
        var _this = _super.call(this, "Stream") || this;
        _this.scheduler = null;
        _this.subscribeFunc = null;
        _this.subscribeFunc = subscribeFunc || function () { };
        return _this;
    }
    Stream.prototype.buildStream = function (observer) {
        return SingleDisposable.create((this.subscribeFunc(observer) || function () { }));
    };
    Stream.prototype.do = function (onNext, onError, onCompleted) {
        return ClassMapUtils.getClass("DoStream").create(this, onNext, onError, onCompleted);
    };
    Stream.prototype.map = function (selector) {
        return ClassMapUtils.getClass("MapStream").create(this, selector);
    };
    Stream.prototype.flatMap = function (selector) {
        return this.map(selector).mergeAll();
    };
    Stream.prototype.concatMap = function (selector) {
        return this.map(selector).concatAll();
    };
    Stream.prototype.mergeAll = function () {
        return ClassMapUtils.getClass("MergeAllStream").create(this);
    };
    Stream.prototype.concatAll = function () {
        return this.merge(1);
    };
    Stream.prototype.skipUntil = function (otherStream) {
        return ClassMapUtils.getClass("SkipUntilStream").create(this, otherStream);
    };
    Stream.prototype.takeUntil = function (otherStream) {
        return ClassMapUtils.getClass("TakeUntilStream").create(this, otherStream);
    };
    Stream.prototype.take = function (count) {
        if (count === void 0) { count = 1; }
        var self = this;
        if (count === 0) {
            return ClassMapUtils.getClass("Operator").empty();
        }
        return ClassMapUtils.getClass("Operator").createStream(function (observer) {
            self.subscribe(function (value) {
                if (count > 0) {
                    observer.next(value);
                }
                count--;
                if (count <= 0) {
                    observer.completed();
                }
            }, function (e) {
                observer.error(e);
            }, function () {
                observer.completed();
            });
        });
    };
    Stream.prototype.takeLast = function (count) {
        if (count === void 0) { count = 1; }
        var self = this;
        if (count === 0) {
            return ClassMapUtils.getClass("Operator").empty();
        }
        return ClassMapUtils.getClass("Operator").createStream(function (observer) {
            var queue = [];
            self.subscribe(function (value) {
                queue.push(value);
                if (queue.length > count) {
                    queue.shift();
                }
            }, function (e) {
                observer.error(e);
            }, function () {
                while (queue.length > 0) {
                    observer.next(queue.shift());
                }
                observer.completed();
            });
        });
    };
    Stream.prototype.takeWhile = function (predicate, thisArg) {
        if (thisArg === void 0) { thisArg = this; }
        var self = this, bindPredicate = null;
        bindPredicate = FunctionUtils.bind(thisArg, predicate);
        return ClassMapUtils.getClass("Operator").createStream(function (observer) {
            var i = 0, isStart = false;
            self.subscribe(function (value) {
                if (bindPredicate(value, i++, self)) {
                    try {
                        observer.next(value);
                        isStart = true;
                    }
                    catch (e) {
                        observer.error(e);
                        return;
                    }
                }
                else {
                    if (isStart) {
                        observer.completed();
                    }
                }
            }, function (e) {
                observer.error(e);
            }, function () {
                observer.completed();
            });
        });
    };
    Stream.prototype.lastOrDefault = function (defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        var self = this;
        return ClassMapUtils.getClass("Operator").createStream(function (observer) {
            var queue = [];
            self.subscribe(function (value) {
                queue.push(value);
                if (queue.length > 1) {
                    queue.shift();
                }
            }, function (e) {
                observer.error(e);
            }, function () {
                if (queue.length === 0) {
                    observer.next(defaultValue);
                }
                else {
                    while (queue.length > 0) {
                        observer.next(queue.shift());
                    }
                }
                observer.completed();
            });
        });
    };
    Stream.prototype.filter = function (predicate, thisArg) {
        if (thisArg === void 0) { thisArg = this; }
        if (this instanceof ClassMapUtils.getClass("FilterStream")) {
            var self_1 = this;
            return self_1.internalFilter(predicate, thisArg);
        }
        return ClassMapUtils.getClass("FilterStream").create(this, predicate, thisArg);
    };
    Stream.prototype.filterWithState = function (predicate, thisArg) {
        if (thisArg === void 0) { thisArg = this; }
        if (this instanceof ClassMapUtils.getClass("FilterStream")) {
            var self_2 = this;
            return self_2.internalFilter(predicate, thisArg);
        }
        return ClassMapUtils.getClass("FilterWithStateStream").create(this, predicate, thisArg);
    };
    Stream.prototype.concat = function () {
        var args = null;
        if (JudgeUtils.isArray(arguments[0])) {
            args = arguments[0];
        }
        else {
            args = Array.prototype.slice.call(arguments, 0);
        }
        args.unshift(this);
        return ClassMapUtils.getClass("ConcatStream").create(args);
    };
    Stream.prototype.merge = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (JudgeUtils.isNumber(args[0])) {
            var maxConcurrent = args[0];
            return ClassMapUtils.getClass("MergeStream").create(this, maxConcurrent);
        }
        if (JudgeUtils.isArray(args[0])) {
            args = arguments[0];
        }
        else {
        }
        var stream = null;
        args.unshift(this);
        stream = ClassMapUtils.getClass("Operator").fromArray(args).mergeAll();
        return stream;
    };
    Stream.prototype.repeat = function (count) {
        if (count === void 0) { count = -1; }
        return ClassMapUtils.getClass("RepeatStream").create(this, count);
    };
    Stream.prototype.ignoreElements = function () {
        return ClassMapUtils.getClass("IgnoreElementsStream").create(this);
    };
    Stream.prototype.handleSubject = function (subject) {
        if (this._isSubject(subject)) {
            this._setSubject(subject);
            return true;
        }
        return false;
    };
    Stream.prototype._isSubject = function (subject) {
        return subject instanceof Subject;
    };
    Stream.prototype._setSubject = function (subject) {
        subject.source = this;
    };
    __decorate([
        requireCheck(function (count) {
            if (count === void 0) { count = 1; }
            assert(count >= 0, Log.info.FUNC_SHOULD("count", ">= 0"));
        })
    ], Stream.prototype, "take", null);
    __decorate([
        requireCheck(function (count) {
            if (count === void 0) { count = 1; }
            assert(count >= 0, Log.info.FUNC_SHOULD("count", ">= 0"));
        })
    ], Stream.prototype, "takeLast", null);
    return Stream;
}(Entity));
export { Stream };
//# sourceMappingURL=Stream.js.map