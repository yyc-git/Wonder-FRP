/// <reference path="../definitions.d.ts"/>
module dyRt{

    export class Stream{
        public scheduler:Scheduler = ABSTRACT_ATTRIBUTE;

        public subscribeFunc:Function = null;

        constructor(subscribeFunc){
            this.subscribeFunc = subscribeFunc || function(){ };
        }

        public subscribe(arg1:Function|Observer|Subject, onError?:Function, onCompleted?:Function):IDisposable {
            throw ABSTRACT_METHOD();
        }

        public buildStream(observer:IObserver){
            this.subscribeFunc(observer);
        }

        public addDisposeHandler(func:Function){
            //todo move to Stream?
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

        public map(selector:Function) {
            return MapStream.create(this, selector);
        }

        private _isSubject(subject){
            return subject instanceof Subject;
        }

        private _setSubject(subject){
            subject.source = this;
        }
    }
}
