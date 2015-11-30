/// <reference path="../filePath.d.ts"/>
module wdFrp {
    export abstract class Observer extends Entity implements IObserver{
        private _isDisposed:boolean = null;
        get isDisposed(){
            return this._isDisposed;
        }
        set isDisposed(isDisposed:boolean){
            this._isDisposed = isDisposed;
        }

        protected onUserNext:Function = null;
        protected onUserError:Function = null;
        protected onUserCompleted:Function = null;

        private _isStop:boolean = false;
        //private _disposeHandler:wdCb.Collection<Function> = wdCb.Collection.create<Function>();
        private _disposable:IDisposable = null;


        constructor(observer:IObserver);
        constructor(onNext:Function, onError:Function, onCompleted:Function);

        constructor(...args) {
            super("Observer");

            if(args.length === 1){
                let observer:IObserver = args[0];

                this.onUserNext = function(v){
                    observer.next(v);
                };
                this.onUserError = function(e){
                    observer.error(e);
                };
                this.onUserCompleted = function(){
                    observer.completed();
                };
            }
            else{
                let onNext = args[0],
                    onError = args[1],
                    onCompleted = args[2];

                this.onUserNext = onNext || function(v){};
                this.onUserError = onError || function(e){
                        throw e;
                    };
                this.onUserCompleted = onCompleted || function(){};
            }
        }

        public next(value) {
            if (!this._isStop) {
                return this.onNext(value);
            }
        }

        public error(error) {
            if (!this._isStop) {
                this._isStop = true;
                this.onError(error);
            }
        }

        public completed() {
            if (!this._isStop) {
                this._isStop = true;
                this.onCompleted();
            }
        }

        public dispose() {
            this._isStop = true;
            this._isDisposed = true;

            if(this._disposable){
                this._disposable.dispose();
            }

            //this._disposeHandler.forEach((handler) => {
            //    handler();
            //});
        }

        //public fail(e) {
        //    if (!this._isStop) {
        //        this._isStop = true;
        //        this.error(e);
        //        return true;
        //    }
        //
        //    return false;
        //}

        public setDisposable(disposable:IDisposable){
            this._disposable = disposable;
        }

        protected abstract onNext(value);

        protected abstract onError(error);

        protected abstract onCompleted();
    }
}
