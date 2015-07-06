/// <reference path="../core/Stream"/>
/// <reference path="../core/Scheduler"/>
module dyRt{
    export class IntervalStream extends BaseStream{
        private _interval:number = null;

        constructor(interval:number, scheduler:Scheduler){
            super(null);

            this._interval = interval;
            this.scheduler = scheduler;

            //todo initWhenCreate
            this._interval = this._interval <= 0 ? 1 : this._interval;
        }

        public subscribeCore(observer:Observer){
            var id = this.scheduler.publishInterval(0, this._interval, function(count){
                observer.next(count);

                return count + 1;
            });

            return function(){
                root.clearInterval(id);
            };
        }
    }
}
