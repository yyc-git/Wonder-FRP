/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class TakeUntilSubject extends OperatorSubject{
        public static create(source:GeneratorSubject, otherSteam:GeneratorSubject) {
            var obj = new this(source, otherSteam);

            return obj;
        }

        private _otherGeneratorSubject:GeneratorSubject = null;

        constructor(source:GeneratorSubject, otherGeneratorSubject:GeneratorSubject){
            super(source);

            this._otherGeneratorSubject = otherGeneratorSubject;
        }

        public next(value:any){
            var self = this;

            this.source.next(value);

            this._otherGeneratorSubject.next = (data:any) => {
                self.source.completed();
            };
        }
    }
}

