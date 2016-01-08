module wdFrp{
    export class RepeatStream extends BaseStream{
        public static create(source:Stream, count:number) {
            var obj = new this(source, count);

            return obj;
        }

        private _source:Stream = null;
        private _count:number = null;

        constructor(source:Stream, count:number){
            super(null);

            this._source = source;
            this._count = count;

            this.scheduler = this._source.scheduler;

            //this.subjectGroup = this._source.subjectGroup;
        }

        public subscribeCore(observer:IObserver){
            var self = this,
            d = GroupDisposable.create();

            function loopRecursive(count) {
                if(count === 0){
                    observer.completed();

                    return;
                }

                d.add(
                    self._source.buildStream(ConcatObserver.create(observer, () => {
                        loopRecursive(count - 1);
                    }))
                );
            }


            this.scheduler.publishRecursive(observer, this._count, loopRecursive);

            return GroupDisposable.create(d);
        }
    }
}

