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

                        self._i = count - 1;
                    }
                }
            });
        }

        public next(value:any){
            try{
                this._sources.getChild(this._i).next(value);
            }
            catch(e){
                this.error(e);
            }
        }

        public subscribe(arg1?:Function|Observer, onError?:Function, onCompleted?:Function):IDisposable{
            this._sources.forEach((subject:GeneratorSubject) => {
                subject.subscribe(arg1, onError, onCompleted);
            });

            return super.subscribe(arg1, onError, onCompleted);
        }

        public remove(observer:Observer){
            this._sources.forEach((subject:GeneratorSubject) => {
                subject.remove(observer);
            });

            super.remove(observer);
        }

        public dispose(){
            this._sources.forEach((subject:GeneratorSubject) => {
                subject.dispose();
            });

            super.dispose();
        }
    }
}
