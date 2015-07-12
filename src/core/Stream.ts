/// <reference path="../definitions.d.ts"/>
module dyRt{

    export class Stream{
        public scheduler:Scheduler = ABSTRACT_ATTRIBUTE;

        protected subscribeFunc:Function = null;

        constructor(subscribeFunc){
            this.subscribeFunc = subscribeFunc || function(){
                };
        }

        /**
         * Determines whether the given object is an Observable
         * @param {Any} An object to determine whether it is an Observable
         * @returns {Boolean} true if an Observable, else false.
         */
        //public isStream(o) {
        //    return o && JudgeUtils.isFunction(o.subscribe);
        //}
        /**
         *  Subscribes an observer to the observable sequence.
         *  @param {Mixed} [observerOrOnNext] The object that is to receive notifications or an action to invoke for each element in the observable sequence.
         *  @param {Function} [onError] Action to invoke upon exceptional termination of the observable sequence.
         *  @param {Function} [onCompleted] Action to invoke upon graceful termination of the observable sequence.
         *  @returns {Diposable} A disposable handling the subscriptions and unsubscriptions.
         */
        public subscribe(arg1, onError, onCompleted):IDisposable {
            throw ABSTRACT_METHOD();
        }

        //todo refactor?
        public subscribeCore(){
            throw ABSTRACT_METHOD();
        }

        public buildStream(){
            this.scheduler.createStreamBySubscribeFunc(this.subscribeFunc);

            this.subscribeCore();
        }

        public addDisposeHandler(func:Function){
            this.scheduler.addDisposeHandler(func);
        }

        protected handleSubject(arg){
            if(this._isSubject(arg)){
                this._setSubject(arg);
                return true;
            }

            return false;
        }

        public do(onNext?:Function, onError?:Function, onCompleted?:Function) {
            return DoStream.create(this, onNext, onError, onCompleted);
        }

        private _isSubject(subject){
            return subject instanceof Subject;
        }

        private _setSubject(subject){
            this.scheduler.target = subject;
            subject.source = this;
        }


    //    /**
    //     * Subscribes to the next value in the sequence with an optional "this" argument.
    //     * @param {Function} onNext The function to invoke on each element in the observable sequence.
    //     * @param {Any} [thisArg] Object to use as this when executing callback.
    //     * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
    //     */
    //    observableProto.subscribeOnNext = function (onNext, thisArg) {
    //    return this._subscribe(observerCreate(typeof thisArg !== 'undefined' ? function(x) { onNext.call(thisArg, x); } : onNext));
    //};
    //
    //    /**
    //     * Subscribes to an exceptional condition in the sequence with an optional "this" argument.
    //     * @param {Function} onError The function to invoke upon exceptional termination of the observable sequence.
    //     * @param {Any} [thisArg] Object to use as this when executing callback.
    //     * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
    //     */
    //    observableProto.subscribeOnError = function (onError, thisArg) {
    //    return this._subscribe(observerCreate(null, typeof thisArg !== 'undefined' ? function(e) { onError.call(thisArg, e); } : onError));
    //};
    //
    //    /**
    //     * Subscribes to the next value in the sequence with an optional "this" argument.
    //     * @param {Function} onCompleted The function to invoke upon graceful termination of the observable sequence.
    //     * @param {Any} [thisArg] Object to use as this when executing callback.
    //     * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
    //     */
    //    observableProto.subscribeOnCompleted = function (onCompleted, thisArg) {
    //    return this._subscribe(observerCreate(null, null, typeof thisArg !== 'undefined' ? function() { onCompleted.call(thisArg); } : onCompleted));
    //};
    }


}
