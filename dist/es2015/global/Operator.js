var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import "../stream/DoStream";
import "../stream/ConcatStream";
import "../stream/MapStream";
import "../stream/MergeAllStream";
import "../stream/SkipUntilStream";
import "../stream/TakeUntilStream";
import "../stream/FilterStream";
import "../stream/FilterWithStateStream";
import "../stream/MergeStream";
import "../stream/RepeatStream";
import "../stream/IgnoreElementsStream";
import "../extend/root";
import { AnonymousStream } from "../stream/AnonymousStream";
import { Scheduler } from "../core/Scheduler";
import { FromArrayStream } from "../stream/FromArrayStream";
import { FromPromiseStream } from "../stream/FromPromiseStream";
import { FromEventPatternStream } from "../stream/FromEventPatternStream";
import { IntervalStream } from "../stream/IntervalStream";
import { IntervalRequestStream } from "../stream/IntervalRequestStream";
import { TimeoutStream } from "../stream/TimeoutStream";
import { root } from "./Variable";
import { DeferStream } from "../stream/DeferStream";
import { registerClass } from "../definition/typescript/decorator/registerClass";
import { EventUtils } from "wonder-commonlib/dist/es2015/utils/EventUtils";
var Operator = (function () {
    function Operator() {
    }
    Operator_1 = Operator;
    Operator.empty = function () {
        return Operator_1.createStream(function (observer) {
            observer.completed();
        });
    };
    Operator.createStream = function (subscribeFunc) {
        return AnonymousStream.create(subscribeFunc);
    };
    Operator.fromArray = function (array, scheduler) {
        if (scheduler === void 0) { scheduler = Scheduler.create(); }
        return FromArrayStream.create(array, scheduler);
    };
    Operator = Operator_1 = __decorate([
        registerClass("Operator")
    ], Operator);
    return Operator;
    var Operator_1;
}());
export { Operator };
export var createStream = Operator.createStream;
export var empty = Operator.empty;
export var fromArray = Operator.fromArray;
export var fromPromise = function (promise, scheduler) {
    if (scheduler === void 0) { scheduler = Scheduler.create(); }
    return FromPromiseStream.create(promise, scheduler);
};
export var fromEvent = function (dom, eventName) {
    return fromEventPattern(function (handler) {
        EventUtils.addEvent(dom, eventName, handler);
    }, function (handler) {
        EventUtils.removeEvent(dom, eventName, handler);
    });
};
export var fromEventPattern = function (addHandler, removeHandler) {
    return FromEventPatternStream.create(addHandler, removeHandler);
};
export var interval = function (interval, scheduler) {
    if (scheduler === void 0) { scheduler = Scheduler.create(); }
    return IntervalStream.create(interval, scheduler);
};
export var intervalRequest = function (scheduler) {
    if (scheduler === void 0) { scheduler = Scheduler.create(); }
    return IntervalRequestStream.create(scheduler);
};
export var timeout = function (time, scheduler) {
    if (scheduler === void 0) { scheduler = Scheduler.create(); }
    return TimeoutStream.create(time, scheduler);
};
export var callFunc = function (func, context) {
    if (context === void 0) { context = root; }
    return createStream(function (observer) {
        try {
            observer.next(func.call(context, null));
        }
        catch (e) {
            observer.error(e);
        }
        observer.completed();
    });
};
export var judge = function (condition, thenSource, elseSource) {
    return condition() ? thenSource() : elseSource();
};
export var defer = function (buildStreamFunc) {
    return DeferStream.create(buildStreamFunc);
};
export var just = function (returnValue) {
    return createStream(function (observer) {
        observer.next(returnValue);
        observer.completed();
    });
};
//# sourceMappingURL=Operator.js.map