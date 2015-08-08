/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class ConcatStream extends BaseStream{
        public static create(source:Stream, otherSources:Array<Stream>) {
            var obj = new this(source, otherSources);

            return obj;
        }

        //private _source:Stream = null;
        private _sources:dyCb.Collection<Stream> = dyCb.Collection.create<Stream>();

        constructor(source:Stream, otherSources:Array<Stream>){
            super(null);

            var self = this;

            //this._source = source;

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

        public buildStream(observer:IObserver){
            //this._source.buildStream(MapObserver.create(observer, this._selector));


            var self = this,
                count = this._sources.getCount();

            //self._sources.getChild(0).buildStream(observer);

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
                //self._sources.getChild(i).subscribe(
                //    (x) => {
                //        observer.next(x);
                //    }, (e) => {
                //        observer.error(e);
                //    }, () => {
                //        loopRecursive(i+1);
                //    }
                //);
                //if (i < len) {
                //    if(next){
                //        next(array[i]);
                //    }
                //    else{
                //        observer.next(array[i]);
                //    }
                //    arguments.callee(i + 1, next, completed);
                //} else {
                //    if(completed){
                //        completed();
                //    }
                //    else{
                //        observer.completed();
                //    }
                //}
            }

            this.scheduler.publishRecursive(observer, 0, loopRecursive);
        }

        public subscribeCore(observer:IObserver){
            //var self = this,
            //    count = this._sources.getCount();
            //
            //    self._sources.getChild(0).subscribeCore(observer)
                    //.subscribe(
                    //(x) => {
                    //    observer.next(x);
                    //}, (e) => {
                    //    observer.error(e);
                    //}, () => {
                    //    loopRecursive(i+1);
                    //}
                //);
            //
            //function loopRecursive(i) {
            //    if(i === count){
            //        observer.completed();
            //
            //        return;
            //    }
            //
            //    self._sources.getChild(i).subscribe(
            //        (x) => {
            //            observer.next(x);
            //        }, (e) => {
            //            observer.error(e);
            //        }, () => {
            //            loopRecursive(i+1);
            //        }
            //    );
            //    //if (i < len) {
            //    //    if(next){
            //    //        next(array[i]);
            //    //    }
            //    //    else{
            //    //        observer.next(array[i]);
            //    //    }
            //    //    arguments.callee(i + 1, next, completed);
            //    //} else {
            //    //    if(completed){
            //    //        completed();
            //    //    }
            //    //    else{
            //    //        observer.completed();
            //    //    }
            //    //}
            //}
            //
            //this.scheduler.publishRecursive(observer, 0, loopRecursive);

            //this.addDisposeHandler(() => {
            //    root.cancelNextRequestAnimationFrame(self.scheduler.requestLoopId);
            //});
        }
    }
}

