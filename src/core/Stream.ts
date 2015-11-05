/// <reference path="../definitions.d.ts"/>
module dyRt{
    export abstract class Stream extends Entity{
        public scheduler:Scheduler = ABSTRACT_ATTRIBUTE;
        public subscribeFunc:(observer:IObserver) => Function|void = null;

        constructor(subscribeFunc){
            super("Stream");

            this.subscribeFunc = subscribeFunc || function(){ };
        }

        public abstract subscribe(arg1:Function|Observer|Subject, onError?:Function, onCompleted?:Function):IDisposable;

        public buildStream(observer:IObserver):IDisposable{
            return SingleDisposable.create(<Function>(this.subscribeFunc(observer) || function(){}));
        }

        public do(onNext?:Function, onError?:Function, onCompleted?:Function) {
            return DoStream.create(this, onNext, onError, onCompleted);
        }

        public map(selector:Function) {
            return MapStream.create(this, selector);
        }

        public flatMap(selector:Function){
            return this.map(selector).mergeAll();
        }

        public mergeAll(){
            return MergeAllStream.create(this);
        }

        public takeUntil(otherStream:Stream){
            return TakeUntilStream.create(this, otherStream);
        }


        public concat(streamArr:Array<Stream>);
        public concat(...otherStream);

        public concat(){
            var args:Array<Stream> = null;

            if(JudgeUtils.isArray(arguments[0])){
                args = arguments[0];
            }
            else{
                args = Array.prototype.slice.call(arguments, 0);
            }

            args.unshift(this);

            return ConcatStream.create(args);
        }

        public merge(streamArr:Array<Stream>);
        public merge(...otherStream);

        public merge(){
            var args:Array<Stream> = null,
                stream:Stream = null;

            if(JudgeUtils.isArray(arguments[0])){
                args = arguments[0];
            }
            else{
                args = Array.prototype.slice.call(arguments, 0);
            }

            args.unshift(this);

            stream = fromArray(args).mergeAll();

            return stream;
        }

        public repeat(count:number = -1){
            return RepeatStream.create(this, count);
        }

        public ignoreElements(){
            return IgnoreElementsStream.create(this);
        }

        protected handleSubject(arg){
            if(this._isSubject(arg)){
                this._setSubject(arg);
                return true;
            }

            return false;
        }

        private _isSubject(subject){
            return subject instanceof Subject;
        }

        private _setSubject(subject){
            subject.source = this;
        }
    }
}
