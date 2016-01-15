module wdFrp{
    export class AnonymousObserver extends Observer{
        public static create(onNext:Function, onError:Function, onCompleted:Function) {
            return new this(onNext, onError, onCompleted);
        }

        protected onNext(value:any, ...args){
            this.onUserNext.apply(this, arguments);
        }

        protected onError(error:any){
            this.onUserError(error);
        }

        protected onCompleted(){
            this.onUserCompleted();
        }
    }
}
