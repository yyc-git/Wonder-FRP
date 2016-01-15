module wdFrp {
    export class FilterObserver extends Observer {
        public static create(prevObserver:IObserver, predicate:(value:any, index?:number, source?:Stream)=>boolean, source:Stream) {
            return new this(prevObserver, predicate, source);
        }

        private _prevObserver:IObserver = null;
        private _source:Stream = null;
        private _predicate:(value:any, index?:number, source?:Stream)=>boolean = null;
        private _i:number = 0;

        constructor(prevObserver:IObserver, predicate:(value:any)=>boolean, source:Stream) {
            super(null, null, null);

            this._prevObserver = prevObserver;
            this._predicate = predicate;
            this._source = source;
        }

        protected onNext(value) {
            try {
                if (this._predicate(value, this._i++, this._source)) {
                    this._prevObserver.next(value);
                }
            }
            catch (e) {
                this._prevObserver.error(e);
            }

        }

        protected onError(error) {
            this._prevObserver.error(error);
        }

        protected onCompleted() {
            this._prevObserver.completed();
        }
    }
}
