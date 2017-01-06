module wdFrp{
    export class SingleDisposable extends Entity implements IDisposable{
        public static create(disposeHandler:Function = function(){}) {
        	var obj = new this(disposeHandler);

        	return obj;
        }

        private _disposeHandler:Function = null;
        private _isDisposed:boolean = false;

        constructor(disposeHandler:Function){
            super("SingleDisposable");

        	this._disposeHandler = disposeHandler;
        }

        public setDisposeHandler(handler:Function){
            this._disposeHandler = handler;
        }

        public dispose(){
            if(this._isDisposed){
                return;
            }

            this._isDisposed = true;

            this._disposeHandler();
        }
    }
}
