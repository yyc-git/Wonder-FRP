/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class Subject implements IObserver{
        public static create() {
            var obj = new this();

            return obj;
        }

        private _source:Stream = null;
        get source(){
            return this._source;
        }
        set source(source:Stream){
            this._source = source;
        }

        private _observers:Collection = Collection.create();

        public subscribe(arg1?:Function|Observer, onError?:Function, onCompleted?:Function):IDisposable{
            var observer = arg1 instanceof Observer
                ? <AutoDetachObserver>arg1
                : AutoDetachObserver.create(<Function>arg1, onError, onCompleted);

            observer.setDisposeHandler(this._source.scheduler.disposeHandler);

            this._observers.addChild(observer);

            return InnerSubscription.create(this, observer);
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
            this._source.buildStream(this);
        }

        public remove(observer:Observer){
            this._observers.removeChild(function(ob:Observer){
                return ob.uid === observer.uid;
            });
        }

        public getObservers():number{
            return this._observers.getCount();
        }

        public dispose(){
            this._observers.forEach(function(ob:Observer){
                ob.dispose();
            });

            this._observers.removeAllChilds();
        }
    }
}
