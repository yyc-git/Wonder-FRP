"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../stream/DoStream");
require("../stream/ConcatStream");
require("../stream/MapStream");
require("../stream/MergeAllStream");
require("../stream/SkipUntilStream");
require("../stream/TakeUntilStream");
require("../stream/FilterStream");
require("../stream/FilterWithStateStream");
require("../stream/MergeStream");
require("../stream/RepeatStream");
require("../stream/IgnoreElementsStream");
require("../extend/root");
var AnonymousStream_1 = require("../stream/AnonymousStream");
var Scheduler_1 = require("../core/Scheduler");
var FromArrayStream_1 = require("../stream/FromArrayStream");
var FromPromiseStream_1 = require("../stream/FromPromiseStream");
var FromEventPatternStream_1 = require("../stream/FromEventPatternStream");
var IntervalStream_1 = require("../stream/IntervalStream");
var IntervalRequestStream_1 = require("../stream/IntervalRequestStream");
var TimeoutStream_1 = require("../stream/TimeoutStream");
var Variable_1 = require("./Variable");
var DeferStream_1 = require("../stream/DeferStream");
var registerClass_1 = require("../definition/typescript/decorator/registerClass");
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
        return AnonymousStream_1.AnonymousStream.create(subscribeFunc);
    };
    Operator.fromArray = function (array, scheduler) {
        if (scheduler === void 0) { scheduler = Scheduler_1.Scheduler.create(); }
        return FromArrayStream_1.FromArrayStream.create(array, scheduler);
    };
    Operator = Operator_1 = __decorate([
        registerClass_1.registerClass("Operator")
    ], Operator);
    return Operator;
    var Operator_1;
}());
exports.Operator = Operator;
exports.createStream = Operator.createStream;
exports.empty = Operator.empty;
exports.fromArray = Operator.fromArray;
exports.fromPromise = function (promise, scheduler) {
    if (scheduler === void 0) { scheduler = Scheduler_1.Scheduler.create(); }
    return FromPromiseStream_1.FromPromiseStream.create(promise, scheduler);
};
exports.fromEventPattern = function (addHandler, removeHandler) {
    return FromEventPatternStream_1.FromEventPatternStream.create(addHandler, removeHandler);
};
exports.interval = function (interval, scheduler) {
    if (scheduler === void 0) { scheduler = Scheduler_1.Scheduler.create(); }
    return IntervalStream_1.IntervalStream.create(interval, scheduler);
};
exports.intervalRequest = function (scheduler) {
    if (scheduler === void 0) { scheduler = Scheduler_1.Scheduler.create(); }
    return IntervalRequestStream_1.IntervalRequestStream.create(scheduler);
};
exports.timeout = function (time, scheduler) {
    if (scheduler === void 0) { scheduler = Scheduler_1.Scheduler.create(); }
    return TimeoutStream_1.TimeoutStream.create(time, scheduler);
};
exports.callFunc = function (func, context) {
    if (context === void 0) { context = Variable_1.root; }
    return exports.createStream(function (observer) {
        try {
            observer.next(func.call(context, null));
        }
        catch (e) {
            observer.error(e);
        }
        observer.completed();
    });
};
exports.judge = function (condition, thenSource, elseSource) {
    return condition() ? thenSource() : elseSource();
};
exports.defer = function (buildStreamFunc) {
    return DeferStream_1.DeferStream.create(buildStreamFunc);
};
exports.just = function (returnValue) {
    return exports.createStream(function (observer) {
        observer.next(returnValue);
        observer.completed();
    });
};
//# sourceMappingURL=Operator.js.map