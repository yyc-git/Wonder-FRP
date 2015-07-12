/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class FromArrayStream extends BaseStream{
        public static create(array:[any], scheduler:Scheduler) {
            var obj = new this(array, scheduler);

            return obj;
        }

        private _array:[any] = null;

        constructor(array:[any], scheduler:Scheduler){
            super(null);

            this._array = array;
            this.scheduler = scheduler;
        }

        public subscribeCore(){
            var array = this._array,
                len = array.length;

            function loopRecursive(i, next, completed) {
                if (i < len) {
                    next(array[i]);
                    arguments.callee(i + 1, next, completed);
                } else {
                    completed();
                }
            }

            this.scheduler.publishRecursive(0, loopRecursive);
        }
    }
}
