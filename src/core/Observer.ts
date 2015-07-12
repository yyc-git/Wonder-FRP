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

        /**
         * Notifies the observer of a new element in the sequence.
         * @param {Any} value Next element in the sequence.
         */
        public next(value) {
            if (!this._isStop) {
                this.onNext(value);
            }
        }

        /**
         * Notifies the observer that an exception has occurred.
         * @param {Any} error The error that has occurred.
         */
        public error(error) {
            if (!this._isStop) {
                this._isStop = true;
                this.onError(error);
            }
        }

        /**
         * Notifies the observer of the end of the sequence.
         */
        public completed() {
            if (!this._isStop) {
                this._isStop = true;
                this.onCompleted();
            }
        }

        /**
         * Disposes the observer, causing it to transition to the stopped state.
         */
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

        //public addDisposeHandler(func:Function){
        //    this.disposeHandler.addChild(func);
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
