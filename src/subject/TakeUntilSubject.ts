/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class TakeUntilSubject extends GeneratorSubject{
        public static create(source:GeneratorSubject, otherSteam:GeneratorSubject) {
            var obj = new this(source, otherSteam);

            return obj;
        }

        private _source:GeneratorSubject = null;
        private _otherGeneratorSubject:GeneratorSubject = null;

        constructor(source:GeneratorSubject, otherGeneratorSubject:GeneratorSubject){
            super();

            this._source = source;
            this._otherGeneratorSubject = otherGeneratorSubject;
        }

        public next(value:any){
            var self = this;

            this._source.next(value);

            this._otherGeneratorSubject.next = (data:any) => {
                self._source.completed();
            };
        }

        public error(error){
            this._source.error(error);
        }

        public completed(){
            this._source.completed();
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

