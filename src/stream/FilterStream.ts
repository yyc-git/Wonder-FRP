module wdFrp{
    export class FilterStream extends BaseStream{
        public static create(source:Stream, predicate:(value:any, index?:number, source?:Stream)=>boolean, thisArg:any) {
            var obj = new this(source, predicate, thisArg);

            return obj;
        }

        constructor(source:Stream, predicate:(value:any, index?:number, source?:Stream)=>boolean, thisArg:any){
            super(null);

            this._source = source;
            this.predicate = wdCb.FunctionUtils.bind(thisArg, predicate);
        }

        public predicate:(value:any, index?:number, source?:Stream)=>boolean = null;

        private _source:Stream = null;

        public subscribeCore(observer:IObserver){
            return this._source.subscribe(this.createObserver(observer));
        }

        public internalFilter(predicate:(value:any, index?:number, source?:Stream)=>boolean, thisArg:any){
            return this.createStreamForInternalFilter(this._source, this._innerPredicate(predicate, this), thisArg);
        }

        protected createObserver(observer:IObserver):Observer{
            return FilterObserver.create(observer, this.predicate, this);
        }

        protected createStreamForInternalFilter(source:Stream, innerPredicate:any, thisArg:any):Stream{
            return FilterStream.create(source, innerPredicate, thisArg);
        }

        private _innerPredicate(predicate:(value:any, index?:number, source?:Stream)=>boolean, self:any){
            return (value, i, o) => {
                return self.predicate(value, i, o) && predicate.call(this, value, i, o);
            }
        }
    }
}

