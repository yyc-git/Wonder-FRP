/*!
to avoid cycle dependence problem and avoid user who use wonder-frp need mannully import stream:
manually import stream which need be imported in Stream.ts here!
 */
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
/*!
 to avoid user who use wonder-frp need mannully import root:
 manually import root here!
 */
import "../extend/root";
import { AnonymousStream } from "../stream/AnonymousStream";
import { Scheduler } from "../core/Scheduler";
import { FromArrayStream } from "../stream/FromArrayStream";
import { FromPromiseStream } from "../stream/FromPromiseStream";
import { FromEventPatternStream } from "../stream/FromEventPatternStream";
import { IntervalStream } from "../stream/IntervalStream";
import { IntervalRequestStream } from "../stream/IntervalRequestStream";
import { TimeoutStream } from "../stream/TimeoutStream";
import { IObserver } from "../observer/IObserver";
import { root } from "./Variable";
import { DeferStream } from "../stream/DeferStream";
import { registerClass } from "../definition/typescript/decorator/registerClass";
import { EventUtils } from "wonder-commonlib/dist/commonjs/utils/EventUtils";

@registerClass("Operator")
export class Operator {
    public static empty() {
        return Operator.createStream((observer: IObserver) => {
            observer.completed();
        });
    }

    public static createStream(subscribeFunc) {
        return AnonymousStream.create(subscribeFunc);
    }

    public static fromArray(array: Array<any>, scheduler = Scheduler.create()) {
        return FromArrayStream.create(array, scheduler);
    }
}

export var createStream = Operator.createStream;

export var empty = Operator.empty;

export var fromArray = Operator.fromArray;

export var fromPromise = (promise: any, scheduler = Scheduler.create()) => {
    return FromPromiseStream.create(promise, scheduler);
};

export var fromEvent = (dom:HTMLElement, eventName:string) => {
    return fromEventPattern((handler) => {
        EventUtils.addEvent(dom, eventName, handler);
    }, (handler) => {
        EventUtils.removeEvent(dom, eventName, handler);
    });
};

export var fromEventPattern = (addHandler: Function, removeHandler: Function) => {
    return FromEventPatternStream.create(addHandler, removeHandler);
};

export var interval = (interval, scheduler = Scheduler.create()) => {
    return IntervalStream.create(interval, scheduler);
};

export var intervalRequest = (scheduler = Scheduler.create()) => {
    return IntervalRequestStream.create(scheduler);
};

export var timeout = (time, scheduler = Scheduler.create()) => {
    return TimeoutStream.create(time, scheduler);
};
export var callFunc = (func: Function, context = root) => {
    return createStream((observer: IObserver) => {
        try {
            observer.next(func.call(context, null));
        }
        catch (e) {
            observer.error(e);
        }

        observer.completed();
    });
};

export var judge = (condition: Function, thenSource: Function, elseSource: Function) => {
    return condition() ? thenSource() : elseSource();
};

export var defer = (buildStreamFunc: Function) => {
    return DeferStream.create(buildStreamFunc);
};

export var just = (returnValue: any) => {
    return createStream((observer: IObserver) => {
        observer.next(returnValue);
        observer.completed();
    });
}
