module wdFrp{
    import Log = wdCb.Log;

    export class TimeoutStream extends BaseStream{
        @require(function(time:number, scheduler:Scheduler){
            assert(time > 0, Log.info.FUNC_SHOULD("time", "> 0"));
        })
        public static create(time:number, scheduler:Scheduler) {
            var obj = new this(time, scheduler);

            return obj;
        }

        private _time:number = null;

        constructor(time:number, scheduler:Scheduler){
            super(null);

            this._time = time;
            this.scheduler = scheduler;
        }

        public subscribeCore(observer:IObserver){
            var id = null;

            id = this.scheduler.publishTimeout(observer, this._time, (time) => {
                observer.next(time);
            });

            return SingleDisposable.create(() => {
                root.clearTimeout(id);
            });
        }
    }
}
