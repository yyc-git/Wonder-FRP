/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class Stream extends Disposer{
        public scheduler:Scheduler = ABSTRACT_ATTRIBUTE;
        public subscribeFunc:Function = null;

        constructor(subscribeFunc){
            super("Stream");

            this.subscribeFunc = subscribeFunc || function(){ };
        }

        public subscribe(arg1:Function|Observer|Subject, onError?:Function, onCompleted?:Function):IDisposable {
            throw ABSTRACT_METHOD();
        }

        public buildStream(observer:IObserver){
            this.subscribeFunc(observer);
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

        public flatMap(selector:Function){
            //return FlatMapStream.create(this, selector);
            return this.map(selector).mergeAll();
        }

        public mergeAll(){
            return MergeAllStream.create(this);
        }

        public takeUntil(otherStream:Stream){
            return TakeUntilStream.create(this, otherStream);
        }

        public concat(streamArr:Array<Stream>);
        //public concat(subjectArr:Array<Subject>);
        public concat(...otherStream);

        public concat(){
            var args = null;

            if(JudgeUtils.isArray(arguments[0])){
                args = arguments[0];
            }
            else{
                args = Array.prototype.slice.call(arguments, 0);
            }

            //todo judge args

            //return ConcatSubject.create(this, args);
            //return new ConcatSubject(this, args);

            return ConcatStream.create(this, args);
        }

        private _isSubject(subject){
            return subject instanceof Subject;
        }

        private _setSubject(subject){
            subject.source = this;
        }
    }
}
