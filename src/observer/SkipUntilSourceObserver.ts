module wdFrp{
    export class SkipUntilSourceObserver extends Observer{
        public static create(prevObserver:IObserver, skipUntilStream:SkipUntilStream) {
            return new this(prevObserver, skipUntilStream);
        }

        private _prevObserver:IObserver = null;
        private _skipUntilStream:SkipUntilStream = null;

        constructor(prevObserver:IObserver, skipUntilStream:SkipUntilStream){
            super(null, null, null);

            this._prevObserver = prevObserver;
            this._skipUntilStream = skipUntilStream;
        }

        protected onNext(value){
            if(this._skipUntilStream.isOpen){
                this._prevObserver.next(value);
            }
        }

        protected onError(error){
            this._prevObserver.error(error);
        }

        protected onCompleted(){
            if(this._skipUntilStream.isOpen){
                this._prevObserver.completed();
            }
        }
    }
}
