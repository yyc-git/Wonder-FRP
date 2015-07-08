/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class Subject extends Stream{
        //private _observers:Collection = Collection.create();
        private _disposeFunc:Function = null;

        public subscribe(onNext?:Function, onError?:Function, onCompleted?:Function):Observer{
            var observer = AutoDetachObserver.create(this.scheduler, onNext, onError, onCompleted);

            //this._observers.addChild(observer);
            this.scheduler.add(observer);

            //return AnonymousSubjectStream.create(observer);
            return observer;
        }

        public subscribeCore():Function{
            return function(){
            };
        }

        public start(){
            //this._observers
            this._disposeFunc = this.buildStream();
        }

        public dispose(){
            this._disposeFunc && this._disposeFunc();
        }
    }
}
