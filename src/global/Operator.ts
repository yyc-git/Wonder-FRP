/// <reference path="../definitions.d.ts"/>
module dyRt{
    export var createStream = function(subscribeFunc) {
        return AnonymousStream.create(subscribeFunc);
    };

    export var fromArray = function(array:[any], scheduler = Scheduler.create()){
        return FromArrayStream.create(array, scheduler);
    };
    export var interval = function (interval, scheduler = Scheduler.create()) {
        return IntervalStream.create(interval, scheduler);
    };
}

