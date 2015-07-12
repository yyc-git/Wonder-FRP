/// <reference path="../definitions.d.ts"/>
module dyRt {
    export class Observer implements IObserver{
        public static UID:number = 1;

        private _uid:number = null;
        get uid(){
            return this._uid;
        }
        set uid(uid:number){
            this._uid = uid;
        }

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
        private _disposeHandler:Collection = Collection.create();

        constructor(onNext:Function, onError:Function, onCompleted:Function) {
            this.onUserNext = onNext || function(){};
            this.onUserError = onError || function(){};
            this.onUserCompleted = onCompleted || function(){};

            this.uid = Observer.UID++;
        }

        public next(value) {
            if (!this._isStop) {
                this.onNext(value);
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

            this._disposeHandler.forEach(function(handler){
                handler();
            });
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

        public setDisposeHandler(disposeHandler:Collection){
            this._disposeHandler = disposeHandler;
        }

        protected onNext(value){
            throw ABSTRACT_METHOD();
        }

        protected onError(error){
            throw ABSTRACT_METHOD();
        }

        protected onCompleted(){
            throw ABSTRACT_METHOD();
        }
    }
}
