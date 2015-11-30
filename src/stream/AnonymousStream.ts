/// <reference path="../filePath.d.ts"/>
module wdFrp{
    export class AnonymousStream extends Stream{
        public static create(subscribeFunc:Function) {
            var obj = new this(subscribeFunc);

            return obj;
        }

        constructor(subscribeFunc:Function) {
            super(subscribeFunc);

            this.scheduler = Scheduler.create();
        }

        public subscribe(onNext, onError, onCompleted):IDisposable {
            var observer:AutoDetachObserver = null;

            if(this.handleSubject(arguments[0])){
                return;
            }

            observer = AutoDetachObserver.create(onNext, onError, onCompleted);

            //observer.setDisposeHandler(this.disposeHandler);


            //
            //observer.setDisposeHandler(Disposer.getDisposeHandler());
            //Disposer.removeAllDisposeHandler();
            observer.setDisposable(this.buildStream(observer));

            return observer;
        }
    }
}
