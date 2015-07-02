/// <reference path="Collection.ts"/>
/// <reference path="Observer.ts"/>
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

        //public publishAll(value:any){
        //    this._queue.map(function(ob){
        //        try{
        //            ob.next(value);
        //        }
        //    });
        //}
    }
}
