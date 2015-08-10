/// <reference path="../definitions.d.ts"/>
module dyRt {
    export class ConcatObserver extends Observer {
        public static create(currentObserver:IObserver, startNextStream:Function) {
            return new this(currentObserver, startNextStream);
        }

        //private currentObserver:IObserver = null;
        protected currentObserver:any = null;
        private _startNextStream:Function = null;

        constructor(currentObserver:IObserver, startNextStream:Function) {
            super(null, null, null);

            this.currentObserver = currentObserver;
            this._startNextStream = startNextStream;
        }

        protected onNext(value){
            try{
                this.currentObserver.next(value);
            }
            catch(e){
                this.currentObserver.error(e);
            }
        }

        protected onError(error) {
            this.currentObserver.error(error);
        }

        protected onCompleted() {
            //this.currentObserver.completed();
            this._startNextStream();
        }
    }
}
