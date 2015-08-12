/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class Stream extends Disposer{
        public scheduler:Scheduler = ABSTRACT_ATTRIBUTE;
        public subscribeFunc:Function = null;
        public subjectGroup:SubjectGroup = SubjectGroup.create();

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

        public getSubjectGroup(){
            this.subjectGroup.stream = this;

            return this.subjectGroup;
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

            args.forEach((source) => {
                if(source.subjectGroup){
                    stream.subjectGroup.addChildren(source.subjectGroup);
                }
            });

            return stream;
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
