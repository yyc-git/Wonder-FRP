module wdFrp{
    export class SkipUntilOtherObserver extends Observer{
        public static create(prevObserver:IObserver, skipUntilStream:SkipUntilStream) {
            return new this(prevObserver, skipUntilStream);
        }

        public otherDisposable:IDisposable = null;

        private _prevObserver:IObserver = null;
        private _skipUntilStream:SkipUntilStream = null;

        constructor(prevObserver:IObserver, skipUntilStream:SkipUntilStream){
            super(null, null, null);

            this._prevObserver = prevObserver;
            this._skipUntilStream = skipUntilStream;
        }

        protected onNext(value){
            this._skipUntilStream.isOpen = true;

            // if(this.otherDisposable.dispose())
            this.otherDisposable.dispose();
        }

        protected onError(error){
            this._prevObserver.error(error);
        }

        protected onCompleted(){
            this.otherDisposable.dispose();
        }
    }
}

