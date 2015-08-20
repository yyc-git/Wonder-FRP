/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class TakeUntilStream extends BaseStream{
        public static create(source:Stream, otherSteam:Stream) {
            var obj = new this(source, otherSteam);

            return obj;
        }

        private _source:Stream = null;
        private _otherStream:Stream = null;

        constructor(source:Stream, otherStream:Stream){
            super(null);

            this._source = source;
            this._otherStream = JudgeUtils.isPromise(otherStream) ? fromPromise(otherStream) : otherStream;

            this.scheduler = this._source.scheduler;
        }

        public subscribeCore(observer:IObserver){
            var group = GroupDisposable.create();

            group.add(this._source.buildStream(observer));
            group.add(this._otherStream.buildStream(TakeUntilObserver.create(observer)));

            return group;
        }
    }
}
