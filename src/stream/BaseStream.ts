/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class BaseStream extends Stream{
        //private _isStart:boolean = false;

        public subscribe(arg1:Function|Observer|Subject, onError?, onCompleted?):IDisposable {
            var observer = null;

            if(this.handleSubject(arg1)){
                return;
            }

            //todo not force set <Autoxxx>?
            observer = arg1 instanceof Observer
                ? <AutoDetachObserver>arg1
                //: AutoDetachObserver.create(this.scheduler, arg1, onError, onCompleted);
                : AutoDetachObserver.create(arg1, onError, onCompleted);

            //todo encapsulate it to scheduleItem
            //this.scheduler.add(observer);
            this.scheduler.target = observer;

            //todo refactor
            //if(observer.cleanCallback){
            //if(this._canBuildStream()){
            Log.error(this._hasMultiObservers(), "should use Subject to handle multi observers");
            //this._isStart = true;
            //setTimeout(function(){
            observer.cleanCallback2 = this.buildStream();
            //}, 0);
            //}

            if(observer.shouldDispose){
                observer.dispose();
            }

            return observer;
        }


        //private _canBuildStream(){
        //    //return !this._isStart;
        //}

        private _hasMultiObservers(){
            return this.scheduler.getObservers() > 1;
        }
    }
}

