/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class GeneratorSubject extends BaseStream implements IObserver {
        private _isStart:boolean = false;
        get isStart(){
            return this._isStart;
        }
        set isStart(isStart:boolean){
            this._isStart = isStart;
        }

        private _observers:dyCb.Collection<IObserver> = dyCb.Collection.create<IObserver>();

        constructor(scheduler:Scheduler){
            super(null);

            this.scheduler = scheduler;
        }

        public subscribe(arg1?:Function|Observer, onError?:Function, onCompleted?:Function):IDisposable{
            var observer = arg1 instanceof Observer
                ? <AutoDetachObserver>arg1
                    : AutoDetachObserver.create(<Function>arg1, onError, onCompleted),
                self = this;

            this._observers.addChild(observer);


            this.addDisposeHandler(() => {
                self.dispose();
            });

            observer.setDisposeHandler(this.disposeHandler);

            return InnerSubscription.create(this, observer);
        }

        public next(value:any){
            this._observers.forEach((ob:Observer) => {
                ob.next(value);
            });
        }

        public error(error:any){
            this._observers.forEach((ob:Observer) => {
                ob.error(error);
            });
        }

        public completed(){
            this._observers.forEach((ob:Observer) => {
                ob.completed();
            });
        }

        public start(){
            this._isStart = true;
        }

        public remove(observer:Observer){
            this._observers.removeChild((ob:Observer) => {
                return JudgeUtils.isEqual(ob, observer);
            });
        }

        public dispose(){
            this._observers.forEach((ob:Observer) => {
                ob.dispose();
            });

            this._observers.removeAllChildren();
        }

        public subscribeCore(observer:IObserver){
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

        private _areAllParamsGenerorSubject(subjectArr:Array<GeneratorSubject>){
            var result = true;

            subjectArr.forEach((subject:GeneratorSubject) => {
                if((subject instanceof GeneratorSubject) === false){
                    result = false;
                    return dyCb.$BREAK;
                }
            });

            return result;
        }
    }
}
