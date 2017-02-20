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
export var createStream = function (subscribeFunc) {
    return AnonymousStream.create(subscribeFunc);
};
export var fromArray = function (array, scheduler) {
    if (scheduler === void 0) { scheduler = Scheduler.create(); }
    return FromArrayStream.create(array, scheduler);
};
export var fromPromise = function (promise, scheduler) {
    if (scheduler === void 0) { scheduler = Scheduler.create(); }
    return FromPromiseStream.create(promise, scheduler);
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
export var empty = function () {
    return createStream(function (observer) {
        observer.completed();
    });
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