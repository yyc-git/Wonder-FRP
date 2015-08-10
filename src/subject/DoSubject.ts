/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class DoSubject extends OperatorSubject{
        public static create(source:GeneratorSubject, onNext?:Function, onError?:Function, onCompleted?:Function) {
            var obj = new this(source, onNext, onError, onCompleted);

            return obj;
        }

        constructor(source:GeneratorSubject, onNext:Function, onError:Function, onCompleted:Function){
            super(source, DoObserver.create(source, AnonymousObserver.create(onNext, onError,onCompleted)));
        }
    }
}

