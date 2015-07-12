/// <reference path="../definitions.d.ts"/>
module dyRt{

    export class Stream{
        public scheduler:Scheduler = ABSTRACT_ATTRIBUTE;

        protected subscribeFunc:Function = null;

        constructor(subscribeFunc){
            this.subscribeFunc = subscribeFunc || function(){
                };
        }

        public subscribe(arg1, onError, onCompleted):IDisposable {
            throw ABSTRACT_METHOD();
        }

        public buildStream(){
            this.scheduler.createStreamBySubscribeFunc(this.subscribeFunc);
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
    }
}
