module wdFrp{
    import Log = wdCb.Log;

    export class MergeObserver extends Observer{
        public static create(currentObserver:IObserver, maxConcurrent:number, groupDisposable:GroupDisposable) {
            return new this(currentObserver, maxConcurrent, groupDisposable);
        }

        constructor(currentObserver:IObserver, maxConcurrent:number, groupDisposable:GroupDisposable){
            super(null, null, null);

            this.currentObserver = currentObserver;
            this._maxConcurrent = maxConcurrent;
            this.groupDisposable = groupDisposable;
        }

        public done:boolean = false;
        public currentObserver:IObserver = null;
        public activeCount:number = 0;
        public q:Array<Stream> = [];
        public groupDisposable:GroupDisposable = null;

        private _maxConcurrent:number = null;

        public handleSubscribe(innerSource:any){
            var disposable:IDisposable = null,
                innerObserver:InnerObserver = InnerObserver.create(this);

            if(JudgeUtils.isPromise(innerSource)){
                innerSource = fromPromise(innerSource);
            }

            disposable = innerSource.buildStream(innerObserver);

            this.groupDisposable.add(disposable);
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

            if(this.activeCount === 0){
                this.currentObserver.completed();
            }
        }

        private _isReachMaxConcurrent(){
            return this.activeCount < this._maxConcurrent;
        }
    }

    class InnerObserver extends Observer{
        public static create(parent:MergeObserver) {
            var obj = new this(parent);

            return obj;
        }

        constructor(parent:MergeObserver){
            super(null, null, null);

            this._parent = parent;
        }

        private _parent:MergeObserver = null;

        protected onNext(value){
            this._parent.currentObserver.next(value);
        }

        protected onError(error){
            this._parent.currentObserver.error(error);
        }

        protected onCompleted(){
            var parent = this._parent;

            if (parent.q.length > 0) {
                parent.activeCount = 0;
                parent.handleSubscribe(parent.q.shift());
            }
            else {
                if(this._isAsync() && parent.activeCount === 0){
                    parent.currentObserver.completed();
                }
            }
        }

        private _isAsync(){
            return this._parent.done;
        }
    }
}
