/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class GeneratorSubject extends Disposer implements IObserver {
        private _isStart:boolean = false;
        get isStart(){
            return this._isStart;
        }
        set isStart(isStart:boolean){
            this._isStart = isStart;
        }

        constructor(){
            super("GeneratorSubject");
        }

        protected observers:dyCb.Collection<IObserver> = dyCb.Collection.create<IObserver>();

        public subscribe(arg1?:Function|Observer, onError?:Function, onCompleted?:Function):IDisposable{
            var observer = arg1 instanceof Observer
                ? <AutoDetachObserver>arg1
                    : AutoDetachObserver.create(<Function>arg1, onError, onCompleted),
                self = this;

            this.observers.addChild(observer);


            this.addDisposeHandler(() => {
                self.dispose();
            });

            observer.setDisposeHandler(this.disposeHandler);

            return InnerSubscription.create(this, observer);
        }

        public next(value:any){
            if(!this._isStart){
                return;
            }

            this.observers.forEach((ob:Observer) => {
                ob.next(value);
            });
        }

        public error(error:any){
            if(!this._isStart){
                return;
            }

            this.observers.forEach((ob:Observer) => {
                ob.error(error);
            });
        }

        public completed(){
            if(!this._isStart){
                return;
            }

            this.observers.forEach((ob:Observer) => {
                ob.completed();
            });
        }

        public start(){
            this._isStart = true;
        }

        public remove(observer:Observer){
            this.observers.removeChild((ob:Observer) => {
                return JudgeUtils.isEqual(ob, observer);
            });
        }

        public dispose(){
            this.observers.forEach((ob:Observer) => {
                ob.dispose();
            });

            this.observers.removeAllChildren();
        }

        public concat(subjectArr:Array<GeneratorSubject>);
        public concat(...otherSubject);

        public concat(){
            var args = null;

            if(JudgeUtils.isArray(arguments[0])){
                args = arguments[0];
            }
            else{
                args = Array.prototype.slice.call(arguments, 0);
            }

            dyCb.Log.error(!this._areAllParamsGenerorSubject(args), "GeneratorSubject->concat can only concat GeneratorSubject");

            return ConcatSubject.create(this, args);
        }

        public map(selector:Function):MapSubject{
            return MapSubject.create(this, selector);
        }

        public do(onNext?:Function, onError?:Function, onCompleted?:Function) {
            return DoSubject.create(this, onNext, onError, onCompleted);
        }

        public takeUntil(otherSubject:GeneratorSubject){
            dyCb.Log.error(!this._areAllParamsGenerorSubject([otherSubject]), "GeneratorSubject->takeUntil can only handle GeneratorSubject");

            return TakeUntilSubject.create(this, otherSubject);
        }

        private _areAllParamsGenerorSubject(subjectArr:Array<GeneratorSubject>){
            var i = null,
                len = subjectArr.length;

            for(i = 0; i < len; i++){
                if((subjectArr[i] instanceof GeneratorSubject) === false){
                    return false;
                }
            }

            return true;
        }
    }
}
