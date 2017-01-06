module wdFrp{
    export class SkipUntilStream extends BaseStream{
        public static create(source:Stream, otherSteam:Stream) {
            var obj = new this(source, otherSteam);

            return obj;
        }

        public isOpen:boolean = false;

        private _source:Stream = null;
        private _otherStream:Stream = null;

        constructor(source:Stream, otherStream:Stream){
            super(null);

            this._source = source;
            this._otherStream = JudgeUtils.isPromise(otherStream) ? fromPromise(otherStream) : otherStream;

            this.scheduler = this._source.scheduler;
        }

        public subscribeCore(observer:IObserver){
            var group = GroupDisposable.create(),
                otherDisposable:IDisposable = null,
                skipUntilOtherObserver:SkipUntilOtherObserver = null;
                // autoDetachObserver = AutoDetachObserver.create(observer),
                // sourceDisposable = null;

            // sourceDisposable = this._source.buildStream(observer);

            group.add(this._source.buildStream(SkipUntilSourceObserver.create(observer, this)));

            // autoDetachObserver.setDisposable(sourceDisposable);

            skipUntilOtherObserver = SkipUntilOtherObserver.create(observer, this);

            otherDisposable = this._otherStream.buildStream(skipUntilOtherObserver);

            skipUntilOtherObserver.otherDisposable = otherDisposable;

            group.add(otherDisposable);

            return group;
        }
    }
}
