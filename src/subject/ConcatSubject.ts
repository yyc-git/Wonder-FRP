/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class ConcatSubject extends GeneratorSubject{
        public static create(source:GeneratorSubject, otherSources:Array<GeneratorSubject>) {
            var obj = new this(source, otherSources);

            obj.initWhenCreate();

            return obj;
        }

        private _sources:dyCb.Collection<GeneratorSubject> = null;
        private _i:number = 0;

        constructor(source:GeneratorSubject, otherSources:Array<GeneratorSubject>){
            super(source.scheduler);

            this._sources = dyCb.Collection.create<GeneratorSubject>([source].concat(otherSources));
        }

        public initWhenCreate(){
            var self = this,
                count = this._sources.getCount();

            this._sources.forEach((source:GeneratorSubject) => {
                source.completed = () => {
                    self._i++;

                    if(self._i >= count){
                        self.completed();

                        self._i = count - 1;
                    }
                }
            });
        }

        public next(value:any){
            try{
            //this._currentObserver.next(value);
            this._sources.getChild(this._i).next(value);
            //this._i++;
            //
            //if(this._i === this._sources.getCount()){
            //    this.completed();
            //}
            }
            catch(e){
                this.error(e);
            }
        }

        //public error(err:any){
        //    try{
        //        this._sources.getChild(this._i).error(err);
        //    }
        //    catch(e){
        //    }
        //    finally{
        //        super.error(err);
        //    }
        //}

        //public completed(){
        //    //todo try catch?
        //
        //    this._i++;
        //
        //    if(this._i === this._sources.getCount()){
        //        super.completed();
        //    }
        //}

        //todo remove "?" ?
        public subscribe(arg1?:Function|Observer, onError?:Function, onCompleted?:Function):IDisposable{
            //var observer = arg1 instanceof Observer
            //    ? <AutoDetachObserver>arg1
            //    : AutoDetachObserver.create(<Function>arg1, onError, onCompleted);

            //this._source && observer.setDisposeHandler(this._source.disposeHandler);

            this._sources.forEach((subject:GeneratorSubject) => {
                //subject.subscribe(observer, onError, onCompleted);
                subject.subscribe(arg1, onError, onCompleted);
            });

            //var self = this;
            //
            //this.addDisposeHandler(() => {
            //    self.dispose();
            //});

            return super.subscribe(arg1, onError, onCompleted);
            //this._observers.addChild(observer);
            //
            //
            ////observer.setDisposeHandler(this.disposeHandler);
            //
            //
            //return InnerSubscription.create(this, observer);



            //var observer = null;
            //
            //if(this.handleSubject(arg1)){
            //    return;
            //}
            //
            //observer = arg1 instanceof Observer
            //    ? arg1
            //    : AutoDetachObserver.create(<Function>arg1, onError, onCompleted);
            //
            //observer.setDisposeHandler(this.disposeHandler);
            //
            ////todo encapsulate it to scheduleItem
            ////todo delete target?
            ////this.scheduler.target = observer;
            //
            ////dyCb.Log.error(this._hasMultiObservers(), "should use Subject to handle multi observers");
            //this.buildStream(observer);
            //
            //return observer;

        }

        public remove(observer:Observer){
            this._sources.forEach((subject:GeneratorSubject) => {
                subject.remove(observer);
            });

            super.remove(observer);
        }

        //public dispose(observer:Observer){
        public dispose(){
            this._sources.forEach((subject:GeneratorSubject) => {
                subject.dispose();
            });

            super.dispose();
        }

        //public buildStream(observer:IObserver){
        //    var self = this;
        //
        //    this._sources.forEach((source:GeneratorSubject) => {
        //      source.buildStream(ConcatSubjectObserver.create(
        //            observer
        //              , ()=>{
        //                //loopRecursive(i + 1);
        //                  self._i++;
        //            })
        //    );
        //    })
        //}

    }

}
