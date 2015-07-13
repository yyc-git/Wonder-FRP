/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class MapObserver extends Observer{
        public static create(selector:Function) {
            return new this(selector);
        }

        private _selector:Function = null;

        constructor(selector:Function){
            super(null, null, null);

            this._selector = selector;
        }

        protected onNext(value){
            //this.onUserNext(value);
            return this._selector(value);
        }

        protected onError(error){
            //this.onUserError(error);
        }

        protected onCompleted(){
            //this.onUserCompleted();
        }
    }
}
