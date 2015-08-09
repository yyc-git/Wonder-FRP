/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class AsyncSubject extends GeneratorSubject {
        public static create(scheduler:Scheduler) {
            var obj = new this(scheduler);

            return obj;
        }
    }
}
