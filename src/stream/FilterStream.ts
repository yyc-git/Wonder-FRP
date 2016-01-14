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

            //this.scheduler = this._source.scheduler;
        }

        public predicate:(value:any, index?:number, source?:Stream)=>boolean = null;

        private _source:Stream = null;

        public subscribeCore(observer:IObserver){
            return this._source.subscribe(FilterObserver.create(observer, this.predicate, this));
        }

        public internalFilter(predicate:(value:any, index?:number, source?:Stream)=>boolean, thisArg:any){
            return FilterStream.create(this._source, this._innerPredicate(predicate, this), thisArg);
        }

        private _innerPredicate(predicate:(value:any, index?:number, source?:Stream)=>boolean, self:any){
            return (value, i, o) => {
                return self.predicate(value, i, o) && predicate.call(this, value, i, o);
            }
        }
    }
}

