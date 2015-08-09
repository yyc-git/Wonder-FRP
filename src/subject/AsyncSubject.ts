/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class AsyncSubject extends GeneratorSubject {
        public static create() {
            var obj = new this();

            return obj;
        }
    }
}
