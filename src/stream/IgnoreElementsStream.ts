/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class IgnoreElementsStream extends BaseStream{
        public static create(source:Stream) {
            var obj = new this(source);

            return obj;
        }

        private _source:Stream = null;

        constructor(source:Stream){
            super(null);

            this._source = source;

            this.scheduler = this._source.scheduler;
        }

        public subscribeCore(observer:IObserver){
            this._source.buildStream(IgnoreElementsObserver.create(observer));
        }
    }
}
