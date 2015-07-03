/// <reference path="../stream/FromArrayStream"/>
/// <reference path="../stream/AnonymousStream"/>
/// <reference path="../stream/IntervalStream"/>
module dyRt{
    //todo add parent?
    export var createStream = function(subscribeFunc) {
        return new AnonymousStream(subscribeFunc);
    };

    export var fromArray = function(array:[any]){
        return new FromArrayStream(array);
    };
    /**
     *  Returns an observable sequence that produces a value after each period.
     *
     * @example
     *  1 - res = Rx.Observable.interval(1000);
     *  2 - res = Rx.Observable.interval(1000, Rx.Scheduler.timeout);
     *
     * @param {Number} period Period for producing the values in the resulting sequence (specified as an integer denoting milliseconds).
     * @param {Scheduler} [scheduler] Scheduler to run the timer on. If not specified, Rx.Scheduler.timeout is used.
     * @returns {Observable} An observable sequence that produces a value after each period.
     */
    export var interval = function (interval, scheduler = new Scheduler()) {
        //return observableTimerTimeSpanAndPeriod(interval, interval, isScheduler(scheduler) ? scheduler : timeoutScheduler);
        //return dueTime === interval ?

        //return new AnonymousStream(function (observer) {
        //    return scheduler.schedulePeriodicWithState(0, interval, function (count) {
        //        observer.onNext(count);
        //        return count + 1;
        //    });
        //});

        return new IntervalStream(interval, scheduler);
    };
}

