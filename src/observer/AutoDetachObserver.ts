module wdFrp{
    export class AutoDetachObserver extends Observer{
        public static create(observer:IObserver);
        public static create(onNext:Function, onError:Function, onCompleted:Function);

        public static create(...args) {
            if(args.length === 1){
                return new this(args[0]);
            }
            else{
                return new this(args[0], args[1], args[2]);
            }
        }

        @require(function(){
            if(this.isDisposed){
                wdCb.Log.warn("only can dispose once");
            }
        })
        public dispose(){
            if(this.isDisposed){
                return;
            }

            super.dispose();
        }

        protected onNext(value:any) {
            try {
                this.onUserNext(value);
            }
            catch (e) {
                this.onError(e);
            }
        }

        protected onError(error:any) {
            try {
                this.onUserError(error);
            }
            catch (e) {
                throw e;
            }
            finally{
                this.dispose();
            }
        }

        protected onCompleted() {
            try {
                this.onUserCompleted();
                this.dispose();
            }
            catch (e) {
                throw e;
            }
        }
    }
}
