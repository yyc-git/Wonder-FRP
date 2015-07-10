/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class DoStream extends BaseStream{
        private _source:Stream = null;
        //private _observer:Observer = null;

        constructor(source:Stream, onNext?:Function, onError?:Function, onCompleted?:Function){
            super(null);

            this._source = source;

            //this._observer = AnonymousObserver.create(onNext, onError,onCompleted);

            this.scheduler = this._source.scheduler;
            //this.scheduler.wrapTarget = this._observer;
            this.scheduler.addWrapTarget(AnonymousObserver.create(onNext, onError,onCompleted));
        }

        public subscribe(arg1:Function|Observer|Subject, onError?, onCompleted?):IDisposable {
            return this._source.subscribe.apply(this._source, arguments);
        }

        public subscribeCore():Function {
            //return this._source.subscribe(new ProxyObserver(this._observer));
            return this._source.subscribeCore();
        }
        //public subscribeCore(){
        //    var self = this,
        //        id = this.scheduler.publishInterval(0, this._interval, function(count) {
        //            self.scheduler.next(count);
        //
        //            return count + 1;
        //        });
        //
        //    return function(){
        //        root.clearInterval(id);
        //    };
        //}
    }
}
