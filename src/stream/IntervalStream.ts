/// <reference path="../core/Stream"/>
/// <reference path="../core/Scheduler"/>
module dyRt{
    export class IntervalStream extends BaseStream{
        private _interval:number = null;

        constructor(interval:number, scheduler:Scheduler){
            this._interval = interval;
            this.scheduler = scheduler;
        }


        public subscribeCore(observer:Observer){
            var id = this.scheduler.publishInterval(0, this._interval, function(count){
                observer.next(count);

                return count + 1;
            });

            return function(){
                root.clearInterval(id);
            };
            //
            //
            //return scheduler.schedulePeriodicWithState(0, period, function (count) {
            //    observer.onNext(count);
            //    return count + 1;
            //});
        }
    }
}
//return new AnonymousStream(function (observer) {
//    return scheduler.schedulePeriodicWithState(0, period, function (count) {
//        observer.onNext(count);
//        return count + 1;
//    });
//});
