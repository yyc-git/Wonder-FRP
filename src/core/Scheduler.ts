/// <reference path="../Collection"/>
/// <reference path="Observer"/>
/// <reference path="../global/Variable"/>
module dyRt {
    export class Scheduler {
        public static create() {
            var obj = new this();

            return obj;
        }

        //private queue:Collection = Collection.create();
        protected queue:Collection = Collection.create();

        public add(observer:Observer) {
            this.queue.addChild(observer);
        }

        public remove(observer:Observer) {
            this.queue.removeChild(function (ob:Observer) {
                return ob.oid === observer.oid;
            });
        }

        public publishRecursive(initial:any, action:Function){
            var self = this;
            //
            //action(initial, action);

            action(initial, function(value){
                self.publishNext(value);
            }, function(){
                self.publishCompleted();
            });
        }

        public publishNext(value:any){
            this.queue.forEach(function(ob:Observer){
                ob.next(value);
            });
        }

        public publishCompleted(){
            this.queue.forEach(function(ob:Observer){
                ob.completed();
            });
        }

        public publishInterval(initial:any, interval:number, action:Function):Collection{
            var idList = Collection.create();

            this.queue.forEach(function(ob:Observer){
               idList.addChild(
                   root.setInterval(function(){
                    initial = action(ob, initial);
                }, interval)
               );
            });

            return idList;
            //

            //return root.setInterval(function(){
            //    initial = action(initial);
            //}, interval)
        }

        public getObservers():number{
            return this.queue.getCount();
        }

        public createStreamBySubscribeFunc(subscribeFunc:Function){
            //todo not force set <Autoxxx>?
            this.queue.forEach(function(observer:AutoDetachObserver){
                observer.cleanCallback = subscribeFunc(observer);
            });
        }

        //public publishAll(value:any){
        //    this.queue.map(function(ob){
        //        try{
        //            ob.next(value);
        //        }
        //    });
        //}
    }
}
