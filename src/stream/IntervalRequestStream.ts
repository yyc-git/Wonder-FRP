/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class IntervalRequestStream extends BaseStream{
        public static create(scheduler:Scheduler) {
            var obj = new this(scheduler);

            return obj;
        }

        constructor(scheduler:Scheduler){
            super(null);

            this.scheduler = scheduler;
        }

        public subscribeCore(observer:IObserver){
            var self = this;

            this.scheduler.publishIntervalRequest(observer, (time) => {
                observer.next(time);
            });

            Disposer.addDisposeHandler(() => {
                root.cancelNextRequestAnimationFrame(self.scheduler.requestLoopId);
            });
        }
    }
}
