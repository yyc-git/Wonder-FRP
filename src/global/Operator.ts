/// <reference path="../definitions.d.ts"/>
module dyRt{
    export var createStream = (subscribeFunc) => {
        return AnonymousStream.create(subscribeFunc);
    };

    export var fromArray = (array:Array<any>, scheduler = Scheduler.create()) =>{
        return FromArrayStream.create(array, scheduler);
    };

    export var fromPromise = (promise:any, scheduler = Scheduler.create()) =>{
        return FromPromiseStream.create(promise, scheduler);
    };

    //export var fromAction = (action:IAction, scheduler = Scheduler.create()) =>{
    //    return FromActionStream.create(action, scheduler);
    //};
    //todo move to DYEngine
    export var fromAction = (action:IAction, scheduler = Scheduler.create()) =>{
        //return FromActionStream.create(action, scheduler);
        var subject = AsyncSubject.create(scheduler);
        var next = subject.next;
        //var self = this;
        subject.next = (data) => {
            try{
                action.update(data);
                next.call(subject, data);

                if(action.isFinish){
                    subject.completed();
                }
            }
            catch(e){
                subject.error(e);
            }
        };

        return subject;
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

