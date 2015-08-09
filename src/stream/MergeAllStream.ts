/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class MergeAllStream extends BaseStream{
        public static create(source:Stream) {
            var obj = new this(source);

            return obj;
        }

        private _source:Stream = null;
        private _observer:Observer = null;

        constructor(source:Stream){
            super(null);

            this._source = source;
            //this._observer = AnonymousObserver.create(onNext, onError,onCompleted);

            this.scheduler = this._source.scheduler;
        }

        public subscribeCore(observer:IObserver){
            var streamGroup = dyCb.Collection.create<Stream>();

            this._source.buildStream(MergeAllObserver.create(observer, streamGroup));
        }
    }
}

