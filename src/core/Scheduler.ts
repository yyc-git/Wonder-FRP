/// <reference path="../definitions.d.ts"/>
module dyRt {
    export class Scheduler {
        public static create() {
            var obj = new this();

            return obj;
        }

        //private queue:Collection = Collection.create();
        //protected queue:Collection = Collection.create();

        private _target:IObserver = null;
        get target(){
            return this._target;
        }
        set target(target:IObserver){
            this._target = target;
        }

        //public add(observer:Observer) {
        //    this.queue.addChild(observer);
        //}

        //public remove(observer:Observer) {
        //    this.queue.removeChild(function (ob:Observer) {
        //        return ob.oid === observer.oid;
        //    });
        //}

        public publishRecursive(initial:any, action:Function){
            var self = this;
            //
            //action(initial, action);

            action(initial, function(value){
                //self.publishNext(value);
                self._target.next(value);
            }, function(){
                self._target.completed();
                //self.publishCompleted();
            });
        }


        public publishInterval(initial:any, interval:number, action:Function):number{
            //var idList = Collection.create();

            //this.queue.forEach(function(ob:Observer){
            //   idList.addChild(
            //       root.setInterval(function(){
            //        initial = action(ob, initial);
            //    }, interval)
            //   );
            //});
            //
            //return idList;
            //

            var self = this;

            return root.setInterval(function(){
                initial = action(self._target, initial);
            }, interval)
        }

        public getObservers():number{
            if(this._target instanceof Observer){
                return 1;
            }
            else if(this._target instanceof Subject){
                let subject = <Subject>this._target;

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
            var observer = <AutoDetachObserver>this._target;

            observer.cleanCallback = subscribeFunc(this._target);
        }
    }
}
