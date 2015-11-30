/// <reference path="../filePath.d.ts"/>
module wdFrp {
    export class IgnoreElementsObserver extends Observer {
        public static create(currentObserver:IObserver) {
            return new this(currentObserver);
        }

        private _currentObserver:IObserver = null;

        constructor(currentObserver:IObserver) {
            super(null, null, null);

            this._currentObserver = currentObserver;
        }

        protected onNext(value){
        }

        protected onError(error) {
            this._currentObserver.error(error);
        }

        protected onCompleted() {
            this._currentObserver.completed();
        }
    }
}
