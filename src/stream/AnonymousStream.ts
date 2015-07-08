/// <reference path="../core/Stream"/>
/// <reference path="../core/Scheduler"/>
/// <reference path="../core/Observer"/>
module dyRt{
    export class AnonymousStream extends Stream{
        constructor(subscribeFunc){
            super(subscribeFunc);

            this.scheduler = Scheduler.create();
        }

        public subscribe(onNext, onError, onCompleted):Observer {
            var observer = null;

            if(this.handleSubject(arguments[0])){
                return;
            }

            observer = AutoDetachObserver.create(this.scheduler, onNext, onError, onCompleted);

            //todo encapsulate it to scheduleItem
            this.scheduler.add(observer);

            observer.cleanCallback = this.subscribeFunc(observer) || function(){};
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
