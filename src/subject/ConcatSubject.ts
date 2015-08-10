/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class ConcatSubject extends GeneratorSubject{
        public static create(source:GeneratorSubject, otherSources:Array<GeneratorSubject>) {
            var obj = new this(source, otherSources);

            obj.initWhenCreate();

            return obj;
        }

        private _observers:dyCb.Collection<IObserver> = dyCb.Collection.create<IObserver>();
        private _sources:dyCb.Collection<GeneratorSubject> = null;

        constructor(source:GeneratorSubject, otherSources:Array<GeneratorSubject>){
            super();

            this._sources = dyCb.Collection.create<GeneratorSubject>([source].concat(otherSources));
        }

        public initWhenCreate(){
            var sources =  this._sources,
                self = this;

            sources.forEach((source:any) => {
                source.parent = self;
            });
        }

        public start(){
            super.start();

            this._sources.getChild(0).start();
        }

        public next(value:any){
            this._iterate((source:GeneratorSubject) =>{
                source.next(value);
            });
        }

        public error(err:any){
            this._iterate((source:GeneratorSubject) =>{
                source.error(err);
            });
        }

        public completed(){
            this._iterate((source:GeneratorSubject) =>{
                source.completed();
            });
        }

        public subscribe(arg1?:Function|Observer, onError?:Function, onCompleted?:Function):IDisposable{
            var innerSubscriptionGroup = InnerSubscriptionGroup.create(),
                observer = arg1 instanceof Observer
                    ? <AutoDetachObserver>arg1
                    : AutoDetachObserver.create(<Function>arg1, onError, onCompleted),
                self = this,
                count = this._sources.getCount();

            this._sources.forEach((source:GeneratorSubject, index:number) => {
                innerSubscriptionGroup.addChild(source.subscribe(observer));

                source.observer = ConcatSubjectObserver.create(source.observer, () => {
                    if(index >= count - 1){
                        self._startNext(source.parent);

                        self._stopHierarchy(source);

                        if(self._isAllCompleted(source)){
                            self._observers.forEach((observer:Observer) => {
                                observer.completed();
                            });
                        }
                        return;
                    }

                    source.stop();
                    self._sources.getChild(index + 1).start();
                });
            });

            this._observers.addChild(observer);

            this.setDisposeHandler(observer);

            innerSubscriptionGroup.addChild(InnerSubscription.create(this, observer));

            return innerSubscriptionGroup;
        }

        public isAllStop(){
            return this._sources.filter((source:GeneratorSubject) => {
                return source.isStart;
            }).getCount() === 0;
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

            if(!parent){
                return;
            }

            do{
                next = parent.getNext(source);
                if(this._isLast(next)){
                    source = parent;
                    next = null;
                }
                parent = parent.parent;
            }while(!next && parent);

            if(next){
                next.start();
            }
        }

        private _isLast(result){
            return result === "last";
        }

        private _iterate(func:Function){
            this._sources.forEach((source:GeneratorSubject) => {
                if(source.isStart){
                    func(source);
                    return dyCb.$BREAK;
                }
            });
        }
    }
}
