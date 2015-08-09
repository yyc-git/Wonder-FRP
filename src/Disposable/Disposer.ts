/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class Disposer extends Entity{
        private _disposeHandler:dyCb.Collection<Function> = dyCb.Collection.create<Function>();
        get disposeHandler(){
            return this._disposeHandler;
        }
        set disposeHandler(disposeHandler:dyCb.Collection<Function>){
            this._disposeHandler = disposeHandler;
        }

        public addDisposeHandler(func:Function){
            this._disposeHandler.addChild(func);
        }
    }
}

