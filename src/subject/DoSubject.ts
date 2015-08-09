/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class DoSubject extends GeneratorSubject{
        public static create(source:GeneratorSubject, onNext?:Function, onError?:Function, onCompleted?:Function) {
            var obj = new this(source, onNext, onError, onCompleted);

            return obj;
        }

        private _source:GeneratorSubject = null;
        private _observer:Observer = null;

        constructor(source:GeneratorSubject, onNext:Function, onError:Function, onCompleted:Function){
            super();

            this._source = source;
            this._observer = AnonymousObserver.create(onNext, onError,onCompleted);
        }

        public next(value:any){
            if(!this._source.isStart){
                return;
            }

            try{
                this._observer.next(value);
            }
            catch(e){
                this._observer.error(e);
                this._source.error(e);
            }
            finally{
                this._source.next(value);
            }
        }

        public error(error){
            if(!this._source.isStart){
                return;
            }

            try{
                this._observer.error(error);
            }
            catch(e){
            }
            finally{
                this._source.error(error);
            }
        }

        public completed(){
            if(!this._source.isStart){
                return;
            }

            try{
                this._observer.completed();
            }
            catch(e){
                this._observer.error(e);
                this._source.error(e);
            }
            finally{
                this._source.completed();
            }
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

