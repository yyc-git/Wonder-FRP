module wdFrp{
    import Log = wdCb.Log;

    export class MergeObserver extends Observer{
        public static create(currentObserver:IObserver, maxConcurrent:number, streamGroup:wdCb.Collection<Stream>, groupDisposable:GroupDisposable) {
            return new this(currentObserver, maxConcurrent, streamGroup, groupDisposable);
        }

        constructor(currentObserver:IObserver, maxConcurrent:number, streamGroup:wdCb.Collection<Stream>, groupDisposable:GroupDisposable){
            super(null, null, null);

            this.currentObserver = currentObserver;
            this._maxConcurrent = maxConcurrent;
            this._streamGroup = streamGroup;
            this._groupDisposable = groupDisposable;
        }

        public done:boolean = false;
        public currentObserver:IObserver = null;
        public activeCount:number = 0;
        public q:Array<Stream> = [];

        private _maxConcurrent:number = null;
        private _groupDisposable:GroupDisposable = null;
        private _streamGroup:wdCb.Collection<Stream> = null;

        public handleSubscribe(innerSource:any){
            if(JudgeUtils.isPromise(innerSource)){
                innerSource = fromPromise(innerSource);
            }

            this._streamGroup.addChild(innerSource);

            this._groupDisposable.add(innerSource.buildStream(InnerObserver.create(this, this._streamGroup, innerSource)));
        }

        @require(function(innerSource:any){
            assert(innerSource instanceof Stream || JudgeUtils.isPromise(innerSource), Log.info.FUNC_MUST_BE("innerSource", "Stream or Promise"));

        })
        protected onNext(innerSource:any){
            if(this._isReachMaxConcurrent()){
                this.activeCount ++;
                this.handleSubscribe(innerSource);

                return;
            }

            this.q.push(innerSource);
        }

        protected onError(error){
            this.currentObserver.error(error);
        }

        protected onCompleted(){
            this.done = true;

            if(this._streamGroup.getCount() === 0){
                this.currentObserver.completed();
            }
        }

        private _isReachMaxConcurrent(){
            return this.activeCount < this._maxConcurrent;
        }
    }

    class InnerObserver extends Observer{
        public static create(parent:MergeObserver, streamGroup:wdCb.Collection<Stream>, currentStream:Stream) {
            var obj = new this(parent, streamGroup, currentStream);

            return obj;
        }

        constructor(parent:MergeObserver, streamGroup:wdCb.Collection<Stream>, currentStream:Stream){
            super(null, null, null);

            this._parent = parent;
            this._streamGroup = streamGroup;
            this._currentStream = currentStream;
        }

        private _parent:MergeObserver = null;
        private _streamGroup:wdCb.Collection<Stream> = null;
        private _currentStream:Stream = null;

        protected onNext(value){
            this._parent.currentObserver.next(value);
        }

        protected onError(error){
            this._parent.currentObserver.error(error);
        }

        protected onCompleted(){
            var parent = this._parent;

            this._streamGroup.removeChild(this._currentStream);

            if (parent.q.length > 0) {
                parent.activeCount = 0;
                parent.handleSubscribe(parent.q.shift());
            }
            else {
                if(this._isAsync() && this._streamGroup.getCount() === 0){
                    parent.currentObserver.completed();
                }
            }
        }

        private _isAsync(){
            return this._parent.done;
        }
    }
}
