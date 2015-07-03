/// <reference path="../Collection"/>
/// <reference path="Observer"/>
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

        public publishRecursive(initial, recursiveFunc:Function){
            var self = this;

            recursiveFunc(initial, function(value){
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

        //public publishAll(value:any){
        //    this._queue.map(function(ob){
        //        try{
        //            ob.next(value);
        //        }
        //    });
        //}
    }
}
