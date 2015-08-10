/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class OperatorSubject extends GeneratorSubject{
        private _source:GeneratorSubject = null;
        private _observer:IObserver = null;

        constructor(source:GeneratorSubject, observer:IObserver){
            super();

            this._source = source;
            this._observer = observer;
        }

        public next(value:any){
            if(!this._source.isStart){
                return;
            }

            this._observer.next(value);
        }

        public error(err:any){
            if(!this._source.isStart){
                return;
            }

            this._observer.error(err);
        }

        public completed(){
            if(!this._source.isStart){
                return;
            }

            this._observer.completed();
        }

        public start(){
            this._source.start();
        }

        public subscribe(arg1?:Function|Observer, onError?:Function, onCompleted?:Function):IDisposable{
            return this._source.subscribe(arg1, onError, onCompleted);
        }

        public remove(observer:Observer){
            this._source.remove(observer);
        }

        public dispose(){
            this._source.dispose();
        }
    }
}

