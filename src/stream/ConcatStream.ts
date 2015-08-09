/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class ConcatStream extends BaseStream{
        public static create(source:Stream, otherSources:Array<Stream>) {
            var obj = new this(source, otherSources);

            return obj;
        }

        private _sources:dyCb.Collection<Stream> = dyCb.Collection.create<Stream>();

        constructor(source:Stream, otherSources:Array<Stream>){
            super(null);

            var self = this;

            this.scheduler = source.scheduler;

            this._sources.addChild(source);

            otherSources.forEach((otherSource) => {
                if(JudgeUtils.isPromise(otherSource)){
                    self._sources.addChild(fromPromise(otherSource));
                }
                else{
                    self._sources.addChild(otherSource);
                }
            });
        }

        public subscribeCore(observer:IObserver){
            var self = this,
                count = this._sources.getCount();

            function loopRecursive(i) {
                if(i === count){
                    observer.completed();

                    return;
                }

                self._sources.getChild(i).buildStream(ConcatObserver.create(
                        observer, ()=>{
                            loopRecursive(i + 1);
                        })
                );
            }

            this.scheduler.publishRecursive(observer, 0, loopRecursive);
        }
    }
}

