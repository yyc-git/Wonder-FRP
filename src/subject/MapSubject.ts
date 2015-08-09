/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class MapSubject extends GeneratorSubject{
        public static create(source:GeneratorSubject, selector:Function) {
            var obj = new this(source, selector);

            return obj;
        }

        private _source:GeneratorSubject = null;
        private _selector:Function = null;

        constructor(source:GeneratorSubject, selector:Function){
            super();

            this._source = source;

            this._selector = selector;
        }

        public next(value:any){
            super.next(this._selector(value));
        }
    }
}

