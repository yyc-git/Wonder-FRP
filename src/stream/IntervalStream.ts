/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class IntervalStream extends BaseStream{
        public static create(interval:number, scheduler:Scheduler) {
            var obj = new this(interval, scheduler);

            return obj;
        }

        private _interval:number = null;

        constructor(interval:number, scheduler:Scheduler){
            super(null);

            this._interval = interval;
            this.scheduler = scheduler;

            //todo initWhenCreate
            this._interval = this._interval <= 0 ? 1 : this._interval;
        }


        public subscribeCore(){
            var self = this,
                id = this.scheduler.publishInterval(0, this._interval, function(count) {
                    self.scheduler.next(count);

                    return count + 1;
                });

            return function(){
                root.clearInterval(id);
            };
        }
    }
}
