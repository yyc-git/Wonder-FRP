/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class ConcatSubject extends GeneratorSubject{
        public static create(source:GeneratorSubject, otherSources:Array<GeneratorSubject>) {
            var obj = new this(source, otherSources);

            obj.initWhenCreate();

            return obj;
        }

        public _sources:dyCb.Collection<GeneratorSubject> = null;
        private _i:number = 0;
        //private _count:number = 0;

        constructor(source:GeneratorSubject, otherSources:Array<GeneratorSubject>){
            super();

            this._sources = dyCb.Collection.create<GeneratorSubject>([source].concat(otherSources));
            //this._sources = this._buildSources(source, otherSources);
        }

        public initWhenCreate(){
            //var self = this,
            //    count = this._sources.getCount();
            //
            //this._sources.forEach((source:GeneratorSubject) => {
            //    source.afterCompleted = () => {
            //        self._i++;
            //
            //        if(self._i >= count){
            //            self.completed();
            //        }
            //    };
            //});

            //var self = this;
            //
            //this._sources.forEach((source:GeneratorSubject) => {
            //    //if(source instanceof ConcatSubject){
            //    self._count += source.getCount();
            //    //}
            //});


            var sources =  this._sources;
            var self = this;

            sources.forEach((source:any) => {
                //if(<any>source._sources){
                //    source._sources.parent = self;
                //}
                //else{
                    source.parent = self;
                //}
            });
        }

        //public getCount(){
        //    var count = 0;
        //
        //    function func(source){
        //
        //    }
        //    this._sources.forEach((source:GeneratorSubject) => {
        //        //if(source instanceof ConcatSubject){
        //        self._count += source.getCount();
        //        //}
        //    });
        //    return this._sources.getCount();
        //}

        public start(){
            super.start();
            //
            //this._sources.forEach((source:GeneratorSubject) => {
            //    source.start();
            //});

            //i = 0
            //
            //this._observer = ConcatObserver.create(
            //    this._sources.getChild(i), ()=>{
            //        loopRecursive(i + 1);
            //    })
            //)
            this._sources.getChild(0).start();
            //this._sources.forEach((source:GeneratorSubject) => {
            //    source.start();
            //});
        }

        public stop(){
            super.stop();

            //this._sources.forEach((source:GeneratorSubject) => {
            //    source.stop();
            //});
        }

        public next(value:any){
            ////this._observer.next(value);
            //var source:GeneratorSubject = null;
            //
            //if(!this.isStart || this._isAllSourceCompleted()){
            //    return;
            //}
            //
            //source = this._sources.getChild(this._i);
            //
            //try{
            //    source.next(value);
            //    this.observers.forEach((ob:Observer) => {
            //        ob.next(value);
            //    });
            //
            //    source.onAfterNext(value);
            //    if(source.onIsCompleted(value)){
            //        source.completed();
            //    }
            //}
            //catch(e){
            //    source.error(e);
            //}
            //
            //this._sources.forEach((source:GeneratorSubject) => {
            //    if(source.isStart){
            //        source.next(value);
            //        return dyCb.$BREAK;
            //    }
            //});
            this._iterate((source:GeneratorSubject) =>{
                source.next(value);
            });
        }

        public error(err:any){
            //if(!this.isStart || this._isAllSourceCompleted()){
            //    return;
            //}
            //
            //this._sources.getChild(this._i).error(err);
            //this.observers.forEach((ob:Observer) => {
            //    ob.error(err);
            //});
            //
            //this._sources.getChild(this._i).onAfterError(err);

            //this._sources.forEach((source:GeneratorSubject) => {
            //    if(source.isStart){
            //        source.error(err);
            //        return dyCb.$BREAK;
            //    }
            //});
            this._iterate((source:GeneratorSubject) =>{
                source.error(err);
            });
        }

        public completed(){
            //if(!this.isStart){
            //    return;
            //}
            //
            //if(this._isAllSourceCompleted()){
            //    this.observers.forEach((ob:Observer) => {
            //        ob.completed();
            //    });
            //    return;
            //}
            //
            //this._sources.getChild(this._i).completed();
            //
            //this._sources.getChild(this._i).onAfterCompleted();
            //

            //this.observers.forEach((observer:Observer) => {
            //    observer.completed();
            //});
            this._iterate((source:GeneratorSubject) =>{
                source.completed();
            });
        }

        private _iterate(func:Function){
            var self = this;

            this._sources.forEach((source:GeneratorSubject) => {
                if(source.isStart){
                    func(source);
                    return dyCb.$BREAK;
                }
            });
        }

        public subscribe(arg1?:Function|Observer, onError?:Function, onCompleted?:Function):IDisposable{
            var innerSubscriptionGroup = InnerSubscriptionGroup.create(),
                observer = arg1 instanceof Observer
                    ? <AutoDetachObserver>arg1
                    : AutoDetachObserver.create(<Function>arg1, onError, onCompleted);



            var self = this;
            var count = this._sources.getCount();

            this._sources.forEach((source:GeneratorSubject, index:number) => {
                innerSubscriptionGroup.addChild(source.subscribe(observer));

                source.observer = ConcatObserver.create(source.observer, () => {
                    if(index >= count - 1){
                        self._startNext(source.parent);

                        self._stopHierarchy(source);

                        if(self._isAllCompleted(source)){
                            self.observers.forEach((observer:Observer) => {
                                observer.completed();
                            });
                        }
                        return;
                    }
                    source.stop();
                    self._sources.getChild(index + 1).start();
                });
            });

            this.observers.addChild(observer);

            innerSubscriptionGroup.addChild(InnerSubscription.create(this, observer));

            return innerSubscriptionGroup;
            //return InnerSubscription.create(this, observer);
        }

        public isAllStop(){
            return this._sources.filter((source:GeneratorSubject) => {
                return source.isStart;
            }).getCount() === 0;
        }

        private _stopHierarchy(source:GeneratorSubject){
            var parent:GeneratorSubject = source.parent;

            source.stop();

            while(parent && parent.isAllStop()){
                parent.stop();
                parent = parent.parent;
            }
        }

        private _isAllCompleted(source:GeneratorSubject){
            var parent:GeneratorSubject = source.parent;

            while(parent && parent.isAllStop()){
                parent = parent.parent;
            }

            return !parent;
        }

        private _startNext(source:GeneratorSubject){
            var parent = source.parent,
                next:any = null;

            do{
                next = parent.getNext(source);
                if(next === "last"){
                    source = source.parent;
                    next = null;
                }
                parent = parent.parent;
            }while(!next && parent);

            //while(!next){
            //    if(!parent){
            //        break;
            //    }
            //    next = parent.getNext(source);
            //
            //    parent = parent.parent;
            //}

            if(next){
                next.start();
            }
        }

        public getNext(source:GeneratorSubject){
            var result = null,
                count = this._sources.getCount(),
                self = this;

            this._sources.forEach((s:GeneratorSubject, index:number) => {
                if(JudgeUtils.isEqual(s, source)){
                    if(index + 1 < count){
                        result = self._sources.getChild(index + 1);
                    }
                    else{
                        result = "last";
                    }

                    return dyCb.$BREAK;
                }
            });

            return result;
        }

        //public remove(observer:Observer){
        //    //this._sources.forEach((subject:GeneratorSubject) => {
        //    //    subject.remove(observer);
        //    //});
        //
        //    super.remove(observer);
        //}
        //
        //public dispose(){
        //    //this._sources.forEach((subject:GeneratorSubject) => {
        //    //    subject.dispose();
        //    //});
        //
        //    super.dispose();
        //}

        private _isAllSourceCompleted(){
            return this._i >= this._sources.getCount();
        }
    }

}
