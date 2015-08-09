/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class OperatorSubject extends GeneratorSubject{
        protected source:GeneratorSubject = null;

        constructor(source:GeneratorSubject){
            super();

            this.source = source;
        }

        public next(value:any){
            this.source.next(value);
        }

        public error(err:any){
            this.source.error(err);
        }

        public completed(){
            this.source.completed();
        }

        public start(){
            this.source.start();
        }

        public subscribe(arg1?:Function|Observer, onError?:Function, onCompleted?:Function):IDisposable{
            return this.source.subscribe(arg1, onError, onCompleted);
        }

        public remove(observer:Observer){
            this.source.remove(observer);
        }

        public dispose(){
            this.source.dispose();
        }
    }
}

