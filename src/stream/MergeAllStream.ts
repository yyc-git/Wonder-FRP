/// <reference path="../filePath.d.ts"/>
module wdFrp{
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
            var streamGroup = wdCb.Collection.create<Stream>(),
                groupDisposable = GroupDisposable.create();

             this._source.buildStream(MergeAllObserver.create(observer, streamGroup, groupDisposable));

            return groupDisposable;
        }
    }
}

