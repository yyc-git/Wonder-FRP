/// <reference path="../filePath.d.ts"/>
module wdFrp{
    export class ConcatStream extends BaseStream{
        public static create(sources:Array<Stream>) {
            var obj = new this(sources);

            return obj;
        }

        private _sources:wdCb.Collection<Stream> = wdCb.Collection.create<Stream>();

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
        }

        public subscribeCore(observer:IObserver){
            var self = this,
                count = this._sources.getCount(),
                d = GroupDisposable.create();

            function loopRecursive(i) {
                if(i === count){
                    observer.completed();

                    return;
                }

                d.add(self._sources.getChild(i).buildStream(ConcatObserver.create(
                        observer, ()=>{
                            loopRecursive(i + 1);
                        })
                ));
            }

            this.scheduler.publishRecursive(observer, 0, loopRecursive);

            return GroupDisposable.create(d);
        }
    }
}

