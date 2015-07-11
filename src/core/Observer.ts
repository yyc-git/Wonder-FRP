/// <reference path="../definitions.d.ts"/>
module dyRt {
    export class Observer implements IObserver{
        //todo use uid
        public static OID:number = 1;

        private _oid:number = null;
        get oid(){
            return this._oid;
        }
        set oid(oid:number){
            this._oid = oid;
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

        constructor(onNext:Function, onError:Function, onCompleted:Function) {
            this.onUserNext = onNext || function(){};
            this.onUserError = onError || function(){};
            this.onUserCompleted = onCompleted || function(){};

            this.oid = Observer.OID++;
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
