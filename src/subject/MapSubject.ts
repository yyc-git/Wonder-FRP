/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class MapSubject extends OperatorSubject{
        public static create(source:GeneratorSubject, selector:Function) {
            var obj = new this(source, selector);

            return obj;
        }

        constructor(source:GeneratorSubject, selector:Function){
            super(source, MapObserver.create(source, selector));
        }
    }
}

