/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class AutoDetachObserver extends Observer{
        public static create(onNext, onError, onCompleted) {
            return new this(onNext, onError, onCompleted);
        }

        //private _cleanCallback:Function = function(){};
        //get cleanCallback(){
        //    return this._cleanCallback;
        //}
        //set cleanCallback(cleanCallback:Function){
        //    this._cleanCallback = cleanCallback;
        //}
        //
        //private _cleanCallback2:Function = function(){};
        //get cleanCallback2(){
        //    return this._cleanCallback2;
        //}
        //set cleanCallback2(cleanCallback2:Function){
        //    this._cleanCallback2 = cleanCallback2;
        //}

        //private _shouldDispose:boolean = null;
        //get shouldDispose(){
        //    return this._shouldDispose;
        //}
        //set shouldDispose(shouldDispose:boolean){
        //    this._shouldDispose = shouldDispose;
        //}

        constructor(onNext, onError, onCompleted){
            super(onNext, onError, onCompleted);
        }

        public dispose(){
            if(this.isDisposed){
                Log.log("only can dispose once");
                return;
            }

            super.dispose();

            //this.disposeHandler.forEach(function(handler){
            //   handler();
            //});

            ////todo refactor, retain one?
            //this._cleanCallback();
            //this._cleanCallback2();
        }

        protected onNext(value) {
            try {
                this.onUserNext(value);
            }
            catch (e) {
                //this.dispose();
                //throw e;
                this.error(e);
            }
        }

        protected onError(err) {
            try {
                this.onUserError(err);
            }
            catch (e) {
                throw e;
            }
            finally{
                this.dispose();
                //this.shouldDispose = true;
            }
        }

        protected onCompleted() {
            try {
                this.onUserCompleted();
                this.dispose();
                //this.shouldDispose = true;
            }
            catch (e) {
                //throw e;
                this.error(e);
            }
            //finally{
            //    this.dispose();
            //}
        }
    }

}
