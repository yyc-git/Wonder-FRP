/// <reference path="../global/Const"/>
/// <reference path="../Log"/>
/// <reference path="Scheduler"/>
module dyRt {
    export class Observer {
        //public static create(onNext, onError, onCompleted) {
        //    return new AnonymousObserver(onNext, onError, onCompleted);
        //}
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
            this.onUserNext = onNext;
            this.onUserError = onError;
            this.onUserCompleted = onCompleted;

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

    export class AnonymousObserver extends Observer{
        protected onNext(value){
            this.onUserNext(value);
        }

        protected onError(error){
            this.onUserError(error);
        }

        protected onCompleted(){
            this.onUserCompleted();
        }
    }

    export class AutoDetachObserver extends Observer{
        public static create(scheduler, onNext, onError, onCompleted) {
            return new this(scheduler ,onNext, onError, onCompleted);
        }

        private _cleanCallback:Function = function(){};
        get cleanCallback(){
            return this._cleanCallback;
        }
        set cleanCallback(cleanCallback:Function){
            this._cleanCallback = cleanCallback;
        }

        private _cleanCallback2:Function = function(){};
        get cleanCallback2(){
            return this._cleanCallback2;
        }
        set cleanCallback2(cleanCallback2:Function){
            this._cleanCallback2 = cleanCallback2;
        }

        private _shouldDispose:boolean = null;
        get shouldDispose(){
            return this._shouldDispose;
        }
        set shouldDispose(shouldDispose:boolean){
            this._shouldDispose = shouldDispose;
        }

        private _scheduler:Scheduler = null;


        constructor(scheduler, onNext, onError, onCompleted){
            super(onNext, onError, onCompleted);

            this._scheduler = scheduler;
        }

        public dispose(){
            if(this.isDisposed){
                Log.log("only can dispose once");
                return;
            }

            super.dispose();

            //todo refactor, retain one?
            this._cleanCallback();
            this._cleanCallback2();

            this._scheduler.remove(this);
        }

        protected onNext(value) {
            try {
                this.onUserNext(value);
            }
            catch (e) {
                //this.dispose();
                //throw e;
                this.error(e);
            }
        }

        protected onError(err) {
            try {
                this.onUserError(err);
            }
            catch (e) {
                throw e;
            }
            finally{
                //this.dispose();
                this.shouldDispose = true;
            }
        }

        protected onCompleted() {
            try {
                this.onUserCompleted();
                //this.dispose();
                this.shouldDispose = true;
            }
            catch (e) {
                //throw e;
                this.error(e);
            }
            //finally{
            //    this.dispose();
            //}
        }
    }
}
