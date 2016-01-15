module wdFrp {
    export class FilterWithStateObserver extends FilterObserver {
        public static create(prevObserver:IObserver, predicate:(value:any, index?:number, source?:Stream)=>boolean, source:Stream) {
            return new this(prevObserver, predicate, source);
        }

        private _isTrigger:boolean = false;

        protected onNext(value) {
            try {
                if (this.predicate(value, this.i++, this.source)) {
                    if(!this._isTrigger){
                        this.prevObserver.next(value, FilterState.ENTER);
                    }
                    else{
                        this.prevObserver.next(value, FilterState.TRIGGER);
                    }

                    this._isTrigger = true;
                }
                else{
                    if(this._isTrigger){
                        this.prevObserver.next(value, FilterState.LEAVE);
                    }

                    this._isTrigger = false;
                }
            }
            catch (e) {
                this.prevObserver.error(e);
            }
        }
    }
}
