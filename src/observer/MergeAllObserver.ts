/// <reference path="../filePath.d.ts"/>
module wdFrp{
    export class MergeAllObserver extends Observer{
        public static create(currentObserver:IObserver, streamGroup:wdCb.Collection<Stream>, groupDisposable:GroupDisposable) {
            return new this(currentObserver, streamGroup, groupDisposable);
        }

        private _currentObserver:IObserver = null;
        get currentObserver(){
            return this._currentObserver;
        }
        set currentObserver(currentObserver:IObserver){
            this._currentObserver = currentObserver;
        }

        private _done:boolean = false;
        get done(){
            return this._done;
        }
        set done(done:boolean){
            this._done = done;
        }

        private _streamGroup:wdCb.Collection<Stream> = null;
        private _groupDisposable:GroupDisposable = null;

        constructor(currentObserver:IObserver, streamGroup:wdCb.Collection<Stream>, groupDisposable:GroupDisposable){
            super(null, null, null);

            this._currentObserver = currentObserver;
            this._streamGroup = streamGroup;
            this._groupDisposable = groupDisposable;
        }

        protected onNext(innerSource:any){
            wdCb.Log.error(!(innerSource instanceof Stream || JudgeUtils.isPromise(innerSource)), wdCb.Log.info.FUNC_MUST_BE("innerSource", "Stream or Promise"));

            if(JudgeUtils.isPromise(innerSource)){
                innerSource = fromPromise(innerSource);
            }

            this._streamGroup.addChild(innerSource);

            this._groupDisposable.add(innerSource.buildStream(InnerObserver.create(this, this._streamGroup, innerSource)));
        }

        protected onError(error){
            this._currentObserver.error(error);
        }

        protected onCompleted(){
            this.done = true;

            if(this._streamGroup.getCount() === 0){
                this._currentObserver.completed();
            }
        }
    }

    class InnerObserver extends Observer{
        public static create(parent:MergeAllObserver, streamGroup:wdCb.Collection<Stream>, currentStream:Stream) {
        	var obj = new this(parent, streamGroup, currentStream);

        	return obj;
        }

        private _parent:MergeAllObserver = null;
        private _streamGroup:wdCb.Collection<Stream> = null;
        private _currentStream:Stream = null;

        constructor(parent:MergeAllObserver, streamGroup:wdCb.Collection<Stream>, currentStream:Stream){
            super(null, null, null);

            this._parent = parent;
            this._streamGroup = streamGroup;
            this._currentStream = currentStream;
        }

        protected onNext(value){
            this._parent.currentObserver.next(value);
        }

        protected onError(error){
            this._parent.currentObserver.error(error);
        }

        protected onCompleted(){
            var currentStream = this._currentStream,
                parent = this._parent;

            this._streamGroup.removeChild((stream:Stream) => {
                return JudgeUtils.isEqual(stream, currentStream);
            });

            //parent.currentObserver.completed();
            //this.dispose();

            /*!
            if this innerSource is async stream(as promise stream),
            it will first exec all parent.next and one parent.completed,
            then exec all this.next and all this.completed
            so in this case, it should invoke parent.currentObserver.completed after the last invokcation of this.completed(have invoked all the innerSource)
            */
            if(this._isAsync() && this._streamGroup.getCount() === 0){
                parent.currentObserver.completed();
            }
        }

        private _isAsync(){
            return this._parent.done;
        }
    }
}
