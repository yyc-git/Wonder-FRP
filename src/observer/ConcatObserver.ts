/// <reference path="../definitions.d.ts"/>
module dyRt {
    export class ConcatObserver extends Observer {
        public static create(currentObserver:IObserver, startNextStream:Function) {
            return new this(currentObserver, startNextStream);
        }

        //private _currentObserver:IObserver = null;
        private _currentObserver:any = null;
        private _startNextStream:Function = null;

        constructor(currentObserver:IObserver, startNextStream:Function) {
            super(null, null, null);

            this._currentObserver = currentObserver;
            this._currentObserver.target = this;
            this._startNextStream = startNextStream;
        }

        protected onNext(value){
            //todo no catch?
            try{
                this._currentObserver.next(value);
            }
            catch(e){
                this._currentObserver.error(e);
            }
        }

        protected onError(error) {
            this._currentObserver.error(error);
        }

        protected onCompleted() {
            //this._currentObserver.completed();
            this._startNextStream();
        }
    }


    export class ConcatSubjectObserver extends Observer {
        public static create(currentObserver:IObserver, addCounterFunc:Function) {
            return new this(currentObserver, addCounterFunc);
        }

        //private _currentObserver:IObserver = null;
        private _currentObserver:any = null;
        private _addCounterFunc:Function = null;

        constructor(currentObserver:IObserver, addCounterFunc:Function) {
            super(null, null, null);

            this._currentObserver = currentObserver;
            this._addCounterFunc = addCounterFunc;
        }

        //public next(value:any){
        //    //todo try catch?
        //    //try{
        //    //this._currentObserver.next(value);
        //    this._sources.getChild(this._i).next(value);
        //    //this._i++;
        //    //
        //    //if(this._i === this._sources.getCount()){
        //    //    this.completed();
        //    //}
        //    //}
        //    //catch(e){
        //    //    this._currentObserver.error(e);
        //    //}
        //}
        //
        //public error(err:any){
        //    try{
        //        this._sources.getChild(this._i).error(err);
        //    }
        //    catch(e){
        //    }
        //    finally{
        //        super.error(err);
        //    }
        //}

        //public completed(){
        //    //todo try catch?
        //
        //    this._i++;
        //
        //    if(this._i === this._sources.getCount()){
        //        super.completed();
        //    }
        //}
        //protected onNext(value){
        //    //todo no catch?
        //    try{
        //        this._currentObserver.next(value);
        //    }
        //    catch(e){
        //        this._currentObserver.error(e);
        //    }
        //}
        //
        //protected onError(error) {
        //    this._currentObserver.error(error);
        //}

        protected onCompleted() {
            this._addCounterFunc();
        }
    }
}
