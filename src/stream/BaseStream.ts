/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class BaseStream extends Stream{
        public subscribeCore(observer:IObserver):IDisposable{
            return dyCb.Log.error(true, dyCb.Log.info.ABSTRACT_METHOD);
        }

        public subscribe(arg1:Function|Observer|Subject, onError?, onCompleted?):IDisposable {
            var observer:Observer = null;

            if(this.handleSubject(arg1)){
                return;
            }

            observer = arg1 instanceof Observer
                ? arg1
                : AutoDetachObserver.create(<Function>arg1, onError, onCompleted);

            //observer.setDisposeHandler(this.disposeHandler);


            observer.setDisposable(this.buildStream(observer));

            return observer;
        }

        public buildStream(observer:IObserver):IDisposable{
            super.buildStream(observer);

            return this.subscribeCore(observer);
        }

        //private _hasMultiObservers(){
        //    return this.scheduler.getObservers() > 1;
        //}
    }
}

