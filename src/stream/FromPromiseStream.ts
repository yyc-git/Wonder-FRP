/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class FromPromiseStream extends BaseStream{
        public static create(promise:any, scheduler:Scheduler) {
        	var obj = new this(promise, scheduler);

        	return obj;
        }

        private _promise:any = null;

        constructor(promise:any, scheduler:Scheduler){
            super(null);

            this._promise = promise;
            this.scheduler = scheduler;
        }

        public subscribeCore(){
            var self = this;

            this._promise.then(function (data) {
                self.scheduler.next(data);
                self.scheduler.completed();
            }, function (err) {
                self.scheduler.error(err);
            });
        }
    }
}
