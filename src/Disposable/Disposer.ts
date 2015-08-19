/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class Disposer extends Entity{
        public static addDisposeHandler(func:Function){
            this._disposeHandler.addChild(func);
        }

        public static getDisposeHandler(){
            return this._disposeHandler.copy();
        }

        public static removeAllDisposeHandler(){
            this._disposeHandler.removeAllChildren();

        }

        //private static _disposeHandler:dyCb.Stack<Function> = dyCb.Stack.create<Function>();
        private static _disposeHandler:dyCb.Collection<Function> = dyCb.Collection.create<Function>();

        //public disposeHandler:dyCb.Collection<Function> = dyCb.Collection.create<Function>();
        //
        //public addDisposeHandler(func:Function){
        //    //this._disposeHandler.addChild(func);
        //}
        //get disposeHandler(){
        //    return this._disposeHandler;
        //}
        //set disposeHandler(disposeHandler:dyCb.Collection<Function>){
        //    this._disposeHandler = disposeHandler;
        //}

    }
}

