/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class BaseStream extends Stream{
        public subscribeCore(){
            throw ABSTRACT_METHOD();
        }

        public subscribe(arg1:Function|Observer|Subject, onError?, onCompleted?):IDisposable {
            var observer = null;

            if(this.handleSubject(arg1)){
                return;
            }

            observer = arg1 instanceof Observer
                ? arg1
                : AutoDetachObserver.create(<Function>arg1, onError, onCompleted);

            observer.setDisposeHandler(this.scheduler.disposeHandler);

            //todo encapsulate it to scheduleItem
            this.scheduler.target = observer;

            Log.error(this._hasMultiObservers(), "should use Subject to handle multi observers");
            this.buildStream();

            return observer;
        }

        public buildStream(){
            super.buildStream();

            this.subscribeCore();
        }

        private _hasMultiObservers(){
            return this.scheduler.getObservers() > 1;
        }
    }
}

