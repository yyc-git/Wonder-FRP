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

        public removeChild(observer:Observer){
            //this._currentObserver.removeChild(observer);
        }
    }
}
