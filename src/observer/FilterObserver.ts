module wdFrp {
    export class FilterObserver extends Observer {
        public static create(prevObserver:IObserver, predicate:(value:any, index?:number, source?:Stream)=>boolean, source:Stream) {
            return new this(prevObserver, predicate, source);
        }

        constructor(prevObserver:IObserver, predicate:(value:any)=>boolean, source:Stream) {
            super(null, null, null);

            this.prevObserver = prevObserver;
            this.predicate = predicate;
            this.source = source;
        }

        protected prevObserver:IObserver = null;
        protected source:Stream = null;
        protected i:number = 0;
        protected predicate:(value:any, index?:number, source?:Stream)=>boolean = null;

        protected onNext(value) {
            try {
                if (this.predicate(value, this.i++, this.source)) {
                    this.prevObserver.next(value);
                }
            }
            catch (e) {
                this.prevObserver.error(e);
            }

        }

        protected onError(error) {
            this.prevObserver.error(error);
        }

        protected onCompleted() {
            this.prevObserver.completed();
        }
    }
}
