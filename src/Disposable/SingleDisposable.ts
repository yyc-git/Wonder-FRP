module wdFrp{
    export class SingleDisposable extends Entity implements IDisposable{
        public static create(disposeHandler:Function = function(){}) {
        	var obj = new this(disposeHandler);

        	return obj;
        }

        private _disposeHandler:Function = null;

        constructor(disposeHandler:Function){
            super("SingleDisposable");

        	this._disposeHandler = disposeHandler;
        }

        public setDisposeHandler(handler:Function){
            this._disposeHandler = handler;
        }

        public dispose(){
            this._disposeHandler();
        }
    }
}
