/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class AnonymousObserver extends Observer{
        public static create(onNext, onError, onCompleted) {
            return new this(onNext, onError, onCompleted);
        }

        protected onNext(value){
            this.onUserNext(value);
        }

        protected onError(error){
            this.onUserError(error);
        }

        protected onCompleted(){
            this.onUserCompleted();
        }
    }
}
