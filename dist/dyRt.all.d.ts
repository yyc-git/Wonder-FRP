declare module dyRt {
    interface IDisposable {
        dispose(): any;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    interface IObserver extends IDisposable {
        next(value: any): any;
        error(error: any): any;
        completed(): any;
    }
}

declare module dyRt {
    var root: any;
}

declare module dyRt {
    var ABSTRACT_METHOD: Function, ABSTRACT_ATTRIBUTE: any;
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class InnerSubscription implements IDisposable {
        static create(subject: Subject, observer: Observer): InnerSubscription;
        private _subject;
        private _observer;
        constructor(subject: Subject, observer: Observer);
        dispose(): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class Entity {
        static UID: number;
        private _uid;
        uid: string;
        constructor(uidPre: string);
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class Stream extends Entity {
        scheduler: Scheduler;
        subscribeFunc: Function;
        private _disposeHandler;
        disposeHandler: dyCb.Collection;
        constructor(subscribeFunc: any);
        subscribe(arg1: Function | Observer | Subject, onError?: Function, onCompleted?: Function): IDisposable;
        buildStream(observer: IObserver): void;
        addDisposeHandler(func: Function): void;
        protected handleSubject(arg: any): boolean;
        do(onNext?: Function, onError?: Function, onCompleted?: Function): DoStream;
        map(selector: Function): MapStream;
        flatMap(selector: Function): MergeAllStream;
        mergeAll(): MergeAllStream;
        takeUntil(otherStream: Stream): TakeUntilStream;
        private _isSubject(subject);
        private _setSubject(subject);
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class Subject implements IObserver {
        static create(): Subject;
        private _source;
        source: Stream;
        private _observers;
        subscribe(arg1?: Function | Observer, onError?: Function, onCompleted?: Function): IDisposable;
        next(value: any): void;
        error(error: any): void;
        completed(): void;
        start(): void;
        remove(observer: Observer): void;
        dispose(): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class Scheduler {
        static create(): Scheduler;
        private _requestLoopId;
        requestLoopId: any;
        publishRecursive(observer: IObserver, initial: any, action: Function): void;
        publishInterval(observer: IObserver, initial: any, interval: number, action: Function): number;
        publishIntervalRequest(observer: IObserver, action: Function): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class Observer extends Entity implements IObserver {
        private _isDisposed;
        isDisposed: boolean;
        protected onUserNext: Function;
        protected onUserError: Function;
        protected onUserCompleted: Function;
        private _isStop;
        private _disposeHandler;
        constructor(onNext: Function, onError: Function, onCompleted: Function);
        next(value: any): void;
        error(error: any): void;
        completed(): void;
        dispose(): void;
        setDisposeHandler(disposeHandler: dyCb.Collection): void;
        protected onNext(value: any): void;
        protected onError(error: any): void;
        protected onCompleted(): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class AnonymousObserver extends Observer {
        static create(onNext: Function, onError: Function, onCompleted: Function): AnonymousObserver;
        protected onNext(value: any): void;
        protected onError(error: any): void;
        protected onCompleted(): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class AutoDetachObserver extends Observer {
        static create(onNext: Function, onError: Function, onCompleted: Function): AutoDetachObserver;
        dispose(): void;
        protected onNext(value: any): void;
        protected onError(err: any): void;
        protected onCompleted(): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class MapObserver extends Observer {
        static create(currentObserver: IObserver, selector: Function): MapObserver;
        private _currentObserver;
        private _selector;
        constructor(currentObserver: IObserver, selector: Function);
        protected onNext(value: any): void;
        protected onError(error: any): void;
        protected onCompleted(): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class DoObserver extends Observer {
        static create(currentObserver: IObserver, prevObserver: IObserver): DoObserver;
        private _currentObserver;
        private _prevObserver;
        constructor(currentObserver: IObserver, prevObserver: IObserver);
        protected onNext(value: any): void;
        protected onError(error: any): void;
        protected onCompleted(): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class MergeAllObserver extends Observer {
        static create(currentObserver: IObserver, streamGroup: dyCb.Collection): MergeAllObserver;
        private _currentObserver;
        currentObserver: IObserver;
        private _streamGroup;
        private _done;
        done: boolean;
        constructor(currentObserver: IObserver, streamGroup: dyCb.Collection);
        protected onNext(innerSource: any): void;
        protected onError(error: any): void;
        protected onCompleted(): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class TakeUntilObserver extends Observer {
        static create(prevObserver: IObserver): TakeUntilObserver;
        private _prevObserver;
        constructor(prevObserver: IObserver);
        protected onNext(value: any): void;
        protected onError(error: any): void;
        protected onCompleted(): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class BaseStream extends Stream {
        subscribeCore(observer: IObserver): void;
        subscribe(arg1: Function | Observer | Subject, onError?: any, onCompleted?: any): IDisposable;
        buildStream(observer: IObserver): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class DoStream extends BaseStream {
        static create(source: Stream, onNext?: Function, onError?: Function, onCompleted?: Function): DoStream;
        private _source;
        private _observer;
        constructor(source: Stream, onNext: Function, onError: Function, onCompleted: Function);
        buildStream(observer: IObserver): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class MapStream extends BaseStream {
        static create(source: Stream, selector: Function): MapStream;
        private _source;
        private _selector;
        constructor(source: Stream, selector: Function);
        buildStream(observer: IObserver): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class FromArrayStream extends BaseStream {
        static create(array: Array<any>, scheduler: Scheduler): FromArrayStream;
        private _array;
        constructor(array: Array<any>, scheduler: Scheduler);
        subscribeCore(observer: IObserver): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class FromPromiseStream extends BaseStream {
        static create(promise: any, scheduler: Scheduler): FromPromiseStream;
        private _promise;
        constructor(promise: any, scheduler: Scheduler);
        subscribeCore(observer: IObserver): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class FromEventPatternStream extends BaseStream {
        static create(addHandler: Function, removeHandler: Function): FromEventPatternStream;
        private _addHandler;
        private _removeHandler;
        constructor(addHandler: Function, removeHandler: Function);
        subscribeCore(observer: IObserver): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class AnonymousStream extends Stream {
        static create(subscribeFunc: Function): AnonymousStream;
        constructor(subscribeFunc: Function);
        subscribe(onNext: any, onError: any, onCompleted: any): IDisposable;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class IntervalStream extends BaseStream {
        static create(interval: number, scheduler: Scheduler): IntervalStream;
        private _interval;
        constructor(interval: number, scheduler: Scheduler);
        initWhenCreate(): void;
        subscribeCore(observer: IObserver): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class MergeAllStream extends BaseStream {
        static create(source: Stream): MergeAllStream;
        private _source;
        private _observer;
        constructor(source: Stream);
        buildStream(observer: IObserver): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class TakeUntilStream extends BaseStream {
        static create(source: Stream, otherSteam: Stream): TakeUntilStream;
        private _source;
        private _otherStream;
        constructor(source: Stream, otherStream: Stream);
        buildStream(observer: IObserver): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    var createStream: (subscribeFunc: any) => AnonymousStream;
    var fromArray: (array: any[], scheduler?: Scheduler) => FromArrayStream;
    var fromPromise: (promise: any, scheduler?: Scheduler) => FromPromiseStream;
    var fromEventPattern: (addHandler: Function, removeHandler: Function) => FromEventPatternStream;
    var interval: (interval: any, scheduler?: Scheduler) => IntervalStream;
    var intervalRequest: (scheduler?: Scheduler) => IntervalRequestStream;
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class Record {
        static create(time: number, value: any, actionType?: ActionType, comparer?: Function): Record;
        private _time;
        time: number;
        private _value;
        value: number;
        private _actionType;
        actionType: ActionType;
        private _comparer;
        constructor(time: any, value: any, actionType: ActionType, comparer: Function);
        equals(other: any): any;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class MockObserver extends Observer {
        static create(scheduler: TestScheduler): MockObserver;
        private _messages;
        messages: [Record];
        private _scheduler;
        constructor(scheduler: TestScheduler);
        protected onNext(value: any): void;
        protected onError(error: any): void;
        protected onCompleted(): void;
        dispose(): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class MockPromise {
        static create(scheduler: TestScheduler, messages: [Record]): MockPromise;
        private _messages;
        private _scheduler;
        constructor(scheduler: TestScheduler, messages: [Record]);
        then(successCb: Function, errorCb: Function, observer: IObserver): void;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class TestScheduler extends Scheduler {
        static next(tick: any, value: any): Record;
        static error(tick: any, error: any): Record;
        static completed(tick: any): Record;
        static create(): TestScheduler;
        private _clock;
        clock: number;
        private _initialClock;
        private _isDisposed;
        private _timerMap;
        private _streamMap;
        private _subscribedTime;
        private _disposedTime;
        setStreamMap(observer: IObserver, messages: [Record]): void;
        remove(observer: Observer): void;
        publishRecursive(observer: IObserver, initial: any, recursiveFunc: Function): void;
        publishInterval(observer: IObserver, initial: any, interval: number, action: Function): number;
        publishIntervalRequest(observer: IObserver, action: Function): number;
        private _setClock();
        startWithTime(create: Function, subscribedTime: number, disposedTime: number): MockObserver;
        startWithSubscribe(create: any, subscribedTime?: number): MockObserver;
        startWithDispose(create: any, disposedTime?: number): MockObserver;
        publicAbsolute(time: any, handler: any): void;
        start(): void;
        createStream(args: any): TestStream;
        createObserver(): MockObserver;
        createResolvedPromise(time: number, value: any): MockPromise;
        createRejectPromise(time: number, error: any): MockPromise;
        private _getMinAndMaxTime();
        private _exec(time, map);
        private _runStream(time);
        private _runAt(time, callback);
        private _tick(time);
    }
}

declare module dyRt {
    enum ActionType {
        NEXT = 0,
        ERROR = 1,
        COMPLETED = 2,
    }
}

declare module dyRt {
    class TestStream extends BaseStream {
        static create(messages: [Record], scheduler: TestScheduler): TestStream;
        scheduler: TestScheduler;
        private _messages;
        constructor(messages: [Record], scheduler: TestScheduler);
        subscribeCore(observer: IObserver): void;
    }
}

/// <reference path="definitions.d.ts" />
declare module dyRt {
    class JudgeUtils extends dyCb.JudgeUtils {
        static isPromise(obj: any): boolean;
        static isEqual(ob1: Entity, ob2: Entity): boolean;
    }
}

/// <reference path="../definitions.d.ts" />
declare module dyRt {
    class IntervalRequestStream extends BaseStream {
        static create(scheduler: Scheduler): IntervalRequestStream;
        constructor(scheduler: Scheduler);
        subscribeCore(observer: IObserver): void;
    }
}
