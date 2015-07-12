/// <reference path="../definitions.d.ts"/>
module dyRt {
    export class Scheduler {
        public static create() {
            var obj = new this();

            return obj;
        }

        //private target:IObserver = null;
        get target(){
            return this._proxyTarget.target;
        }
        set target(target:IObserver){
            this._proxyTarget.target = target;
        }

        private _disposeHandler:Collection = Collection.create();
        get disposeHandler(){
            return this._disposeHandler;
        }
        set disposeHandler(disposeHandler:Collection){
            this._disposeHandler = disposeHandler;
        }

        private _proxyTarget:ProxyTarget = ProxyTarget.create();


        public publishRecursive(initial:any, action:Function){
            var self = this;

            action(initial, function(value){
                //self.publishNext(value);
                self.next(value);
            }, function(){
                self.completed();
                //self.publishCompleted();
            });
        }


        public publishInterval(initial:any, interval:number, action:Function):number{
            var self = this;

            return root.setInterval(function(){
                initial = action(self.target, initial);
            }, interval)
        }

        public getObservers():number{
            if(this.target instanceof Observer){
                return 1;
            }
            else if(this.target instanceof Subject){
                let subject = <Subject>this.target;

                return subject.getObservers();
            }
            else{
                Log.error(true, Log.info.FUNC_UNEXPECT("target"));
            }
        }

        public createStreamBySubscribeFunc(subscribeFunc:Function){
            //todo not force set <Autoxxx>?
            //this.queue.forEach(function(observer:AutoDetachObserver){
            //    observer.cleanCallback = subscribeFunc(observer);
            //});
            var observer = <AutoDetachObserver>this.target;

            //observer.cleanCallback = subscribeFunc(this);
            subscribeFunc(this);
        }

        public addDisposeHandler(func:Function){
            //this._proxyTarget.addDisposeHandler(func);
            this._disposeHandler.addChild(func);
        }

        //public execDisposeHandler(){
        //    this._disposeHandler.forEach(function(handler){
        //        handler();
        //    });
        //}

        public next(value) {
            this._proxyTarget.next(value);
        }

        public error(error) {
            this._proxyTarget.error(error);
        }

        public completed() {
            this._proxyTarget.completed();
        }

        public dispose(){
            this._proxyTarget.dispose();
        }

        public addWrapTarget(wrapTarget:IObserver){
            this._proxyTarget.addWrapTarget(wrapTarget);
        }
    }
}
