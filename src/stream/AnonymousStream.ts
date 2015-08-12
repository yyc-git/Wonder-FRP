/// <reference path="../definitions.d.ts"/>
module dyRt{
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
            var observer = null;

            if(this.handleSubject(arguments[0])){
                return;
            }

            observer = AutoDetachObserver.create(onNext, onError, onCompleted);

            observer.setDisposeHandler(this.disposeHandler);

            this.buildStream(observer);

            return observer;
        }
    }
}
