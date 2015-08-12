/// <reference path="../definitions.d.ts"/>
module dyRt{
    export var createStream = (subscribeFunc) => {
        return AnonymousStream.create(subscribeFunc);
    };

    export var defer = (rewriteFunc) => {
        var subject = GeneratorSubject.create();

        rewriteFunc(subject);

        return subject.toStream();
    };

    export var fromArray = (array:Array<any>, scheduler = Scheduler.create()) =>{
        return FromArrayStream.create(array, scheduler);
    };

    export var fromPromise = (promise:any, scheduler = Scheduler.create()) =>{
        return FromPromiseStream.create(promise, scheduler);
    };

    export var fromEventPattern = (addHandler:Function, removeHandler:Function) =>{
        return FromEventPatternStream.create(addHandler, removeHandler);
    };

    export var interval = (interval, scheduler = Scheduler.create()) => {
        return IntervalStream.create(interval, scheduler);
    };

    export var intervalRequest = (scheduler = Scheduler.create()) => {
        return IntervalRequestStream.create(scheduler);
    };
}

