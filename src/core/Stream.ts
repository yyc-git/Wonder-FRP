module wdFrp{
    import Log = wdCb.Log;

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

        @require(function(count:number = 1){
            assert(count >= 0, Log.info.FUNC_SHOULD("count", ">= 0"));
        })
        public take(count:number = 1){
            var self = this;

            if(count === 0){
                return empty();
            }

            return createStream((observer:IObserver) => {
                self.subscribe((value:any) => {
                    if(count > 0){
                        observer.next(value);
                    }

                    count--;

                    if(count <= 0){
                        observer.completed();
                    }
                }, (e:any) => {
                    observer.error(e);
                }, () => {
                    observer.completed();
                });
            });
        }

        @require(function(count:number = 1){
            assert(count >= 0, Log.info.FUNC_SHOULD("count", ">= 0"));
        })
        public takeLast(count:number = 1){
            var self = this;

            if(count === 0){
                return empty();
            }

            return createStream((observer:IObserver) => {
                var queue = [];

                self.subscribe((value:any) => {
                    queue.push(value);

                    if(queue.length > count){
                        queue.shift();
                    }
                }, (e:any) => {
                    observer.error(e);
                }, () => {
                    while(queue.length > 0){
                        observer.next(queue.shift());
                    }

                    observer.completed();
                });
            });
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

        protected handleSubject(subject:any){
            if(this._isSubject(subject)){
                this._setSubject(subject);
                return true;
            }

            return false;
        }

        private _isSubject(subject:Subject){
            return subject instanceof Subject;
        }

        private _setSubject(subject:Subject){
            subject.source = this;
        }
    }
}
