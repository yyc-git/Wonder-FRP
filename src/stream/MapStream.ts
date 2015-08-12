/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class MapStream extends BaseStream{
        public static create(source:Stream, selector:Function) {
            var obj = new this(source, selector);

            return obj;
        }

        private _source:Stream = null;
        private _selector:Function = null;

        constructor(source:Stream, selector:Function){
            super(null);

            this._source = source;

            this.scheduler = this._source.scheduler;
            //this.scheduler.addWrapTarget(MapObserver.create(selector));
            this._selector = selector;

            this.subjectGroup = this._source.subjectGroup;
        }

        public subscribeCore(observer:IObserver){
            this._source.buildStream(MapObserver.create(observer, this._selector));
        }
    }
}
