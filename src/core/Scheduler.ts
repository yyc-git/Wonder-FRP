/// <reference path="../definitions.d.ts"/>
module dyRt {
    export class Scheduler{
        public static create() {
            var obj = new this();

            return obj;
        }

        private _disposeHandler:Collection = Collection.create();
        get disposeHandler(){
            return this._disposeHandler;
        }
        set disposeHandler(disposeHandler:Collection){
            this._disposeHandler = disposeHandler;
        }

        public publishRecursive(observer:IObserver, initial:any, action:Function){
            action(initial);
        }

        public publishInterval(observer:IObserver, initial:any, interval:number, action:Function):number{
            return root.setInterval(function(){
                initial = action(initial);
            }, interval)
        }

        public addDisposeHandler(func:Function){
            this._disposeHandler.addChild(func);
        }
    }
}
