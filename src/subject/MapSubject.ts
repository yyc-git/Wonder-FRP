/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class MapSubject extends OperatorSubject{
        public static create(source:GeneratorSubject, selector:Function) {
            var obj = new this(source, selector);

            return obj;
        }

        private _selector:Function = null;

        constructor(source:GeneratorSubject, selector:Function){
            super(source);

            this._selector = selector;
        }

        public next(value:any){
            try{
                this.source.next(this._selector(value));
            }
            catch(e){
                this.source.error(e);
            }
        }
    }
}

