/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class TakeUntilSubject extends OperatorSubject{
        public static create(source:GeneratorSubject, otherSteam:GeneratorSubject) {
            var obj = new this(source, otherSteam);

            return obj;
        }

        constructor(source:GeneratorSubject, otherGeneratorSubject:GeneratorSubject){
            //super(source, TakeUntilObserver.create(source));
            super(source, source);

            otherGeneratorSubject.observer = TakeUntilObserver.create(source);
        }
    }
}

