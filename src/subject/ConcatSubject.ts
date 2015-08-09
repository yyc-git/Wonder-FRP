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
            super();

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
                    }
                }
            });
        }

        public start(){
            super.start();

            this._sources.forEach((source:GeneratorSubject) => {
                source.start();
            });
        }

        public next(value:any){
            var source = null;

            if(!this.isStart || this._isAllSourceCompleted()){
                return;
            }

            source = this._sources.getChild(this._i);

            try{
                source.next(value);
            }
            catch(e){
                source.error(e);
            }
        }

        private _isAllSourceCompleted(){
            return this._i >= this._sources.getCount();
        }

        public error(err:any){
            if(!this.isStart || this._isAllSourceCompleted()){
                return;
            }

            this._sources.getChild(this._i).error(err);
        }

        public completed(){
            if(!this.isStart){
                return;
            }

            if(this._isAllSourceCompleted()){
                this.observers.forEach((ob:Observer) => {
                    ob.completed();
                });
                return;
            }

            this._sources.getChild(this._i).completed();
        }

        public subscribe(arg1?:Function|Observer, onError?:Function, onCompleted?:Function):IDisposable{
            var innerSubscriptionGroup = InnerSubscriptionGroup.create(),
                observer = arg1 instanceof Observer
                    ? <AutoDetachObserver>arg1
                    : AutoDetachObserver.create(<Function>arg1, onError, onCompleted);

            this._sources.forEach((subject:GeneratorSubject) => {
                innerSubscriptionGroup.addChild(subject.subscribe(observer, onError, onCompleted));
            });

            this.observers.addChild(observer);

            return innerSubscriptionGroup;
        }

        public remove(observer:Observer){
            this._sources.forEach((subject:GeneratorSubject) => {
                subject.remove(observer);
            });

            //super.remove(observer);
        }

        public dispose(){
            this._sources.forEach((subject:GeneratorSubject) => {
                subject.dispose();
            });

            //super.dispose();
        }
    }
}
