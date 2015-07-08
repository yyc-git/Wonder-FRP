/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class Subject implements IObserver{
        private _stream:Stream = null;
        get stream(){
            return this._stream;
        }
        set stream(stream:Stream){
            this._stream = stream;
        }

        private _observers:Collection = Collection.create();
        private _disposeFunc:Function = null;

        public subscribe(onNext?:Function, onError?:Function, onCompleted?:Function):IDisposable{
            var observer = AutoDetachObserver.create(this._stream.scheduler, onNext, onError, onCompleted);

            //this._observers.addChild(observer);
            this._observers.addChild(observer);

            return InnerSubscription.create(this, observer);
            //return observer;
        }

        public next(value:any){
            this._observers.forEach(function(ob:Observer){
                ob.next(value);
            });
        }

        public error(error:any){
            this._observers.forEach(function(ob:Observer){
                ob.error(error);
            });
        }

        public completed(){
            this._observers.forEach(function(ob:Observer){
                ob.completed();
            });
        }

        public start(){
            //this._disposeFunc = this.buildStream();
            this._disposeFunc = this._stream.buildStream();
        }

        public remove(observer:Observer){
            this._observers.removeChild(function(ob:Observer){
                return ob.oid === observer.oid;
            });
        }

        public getObservers():number{
            return this._observers.getCount();
        }

        public dispose(){
            this._disposeFunc && this._disposeFunc();
        }
    }
}
