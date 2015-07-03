/// <reference path="../Collection"/>
/// <reference path="Observer"/>
/// <reference path="../global/Variable"/>
module dyRt {
    export class Scheduler {
        public static create() {
            var obj = new this();

            return obj;
        }

        private _queue:Collection = Collection.create();

        public add(observer:Observer) {
            this._queue.addChild(observer);
        }

        public remove(observer:Observer) {
            this._queue.removeChild(function (ob:Observer) {
                return ob.oid === observer.oid;
            });
        }

        public publishRecursive(initial:any, action:Function){
            var self = this;

            action(initial, function(value){
                self.publishNext(value);
            }, function(){
               self.publishCompleted();
            });
        }

        public publishNext(value:any){
            this._queue.map(function(ob:Observer){
                ob.next(value);
            });
        }

        public publishCompleted(){
            this._queue.map(function(ob:Observer){
                ob.completed();
            });
        }

        public publishInterval(initial:any, interval:number, action:Function){
            root.setInterval(function(){
                  initial = action(initial);
               }, interval);
        }

        //public publishAll(value:any){
        //    this._queue.map(function(ob){
        //        try{
        //            ob.next(value);
        //        }
        //    });
        //}
    }
}
