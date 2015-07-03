/// <reference path="../core/Stream"/>
/// <reference path="../core/Scheduler"/>
module dyRt{
    export class FromArrayStream extends BaseStream{
        private _array:[any] = null;

        constructor(array:[any]){
            super(null);

            this._array = array;
            this.scheduler = Scheduler.create();
        }

        public subscribeCore(observer:Observer){
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

            return function(){
            };
        }
    }
}
