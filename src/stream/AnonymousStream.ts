/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class AnonymousStream extends Stream{
        constructor(subscribeFunc){
            super(subscribeFunc);

            this.scheduler = Scheduler.create();
        }

        public subscribe(onNext, onError, onCompleted):IDisposable {
            var observer = null;

            if(this.handleSubject(arguments[0])){
                return;
            }

            //observer = AutoDetachObserver.create(this.scheduler, onNext, onError, onCompleted);
            observer = AutoDetachObserver.create(onNext, onError, onCompleted);

            //todo encapsulate it to scheduleItem
            //this.scheduler.add(observer);
            this.scheduler.target = observer;

            //observer.cleanCallback = this.subscribeFunc(observer) || function(){};
            observer.cleanCallback = this.subscribeFunc(this.scheduler) || function(){};
            if(observer.shouldDispose){
                observer.dispose();
            }

            return observer;
        }

        public subscribeCore():Function{
            return function(){
            };
        }
    }
}
