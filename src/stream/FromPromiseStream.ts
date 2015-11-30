/// <reference path="../filePath.d.ts"/>
module wdFrp{
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

        public subscribeCore(observer:IObserver){
            this._promise.then((data) => {
                observer.next(data);
                observer.completed();
            }, (err) => {
                observer.error(err);
            }, observer);

            return SingleDisposable.create();
        }
    }
}
