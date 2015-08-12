/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class ConcatStream extends BaseStream{
        public static create(sources:Array<Stream>) {
            var obj = new this(sources);

            return obj;
        }

        private _sources:dyCb.Collection<Stream> = dyCb.Collection.create<Stream>();

        constructor(sources:Array<Stream>){
            super(null);

            var self = this;

            //todo don't set scheduler here?
            this.scheduler = sources[0].scheduler;

            sources.forEach((source) => {
                if(JudgeUtils.isPromise(source)){
                    self._sources.addChild(fromPromise(source));
                }
                else{
                    self._sources.addChild(source);
                }
            });

            this._sources.forEach((source) => {
                self.subjectGroup.addChildren(source.subjectGroup);
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

