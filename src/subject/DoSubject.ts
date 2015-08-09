/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class DoSubject extends OperatorSubject{
        public static create(source:GeneratorSubject, onNext?:Function, onError?:Function, onCompleted?:Function) {
            var obj = new this(source, onNext, onError, onCompleted);

            return obj;
        }

        private _observer:Observer = null;

        constructor(source:GeneratorSubject, onNext:Function, onError:Function, onCompleted:Function){
            super(source);

            this._observer = AnonymousObserver.create(onNext, onError,onCompleted);
        }

        public next(value:any){
            if(!this.source.isStart){
                return;
            }

            try{
                this._observer.next(value);
            }
            catch(e){
                this._observer.error(e);
                this.source.error(e);
            }
            finally{
                this.source.next(value);
            }
        }

        public error(error){
            if(!this.source.isStart){
                return;
            }

            try{
                this._observer.error(error);
            }
            catch(e){
            }
            finally{
                this.source.error(error);
            }
        }

        public completed(){
            if(!this.source.isStart){
                return;
            }

            try{
                this._observer.completed();
            }
            catch(e){
                this._observer.error(e);
                this.source.error(e);
            }
            finally{
                this.source.completed();
            }
        }
    }
}

