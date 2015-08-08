/// <reference path="../definitions.d.ts"/>
module dyRt{
//todo extract Base class?

    export class AsyncSubject extends BaseStream implements IObserver {
        public static create(scheduler:Scheduler) {
            var obj = new this(scheduler);

            return obj;
        }

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
                : AutoDetachObserver.create(<Function>arg1, onError, onCompleted);

            //this._source && observer.setDisposeHandler(this._source.disposeHandler);

            this._observers.addChild(observer);

            var self = this;

            this.addDisposeHandler(() => {
                self.dispose();
            });

            observer.setDisposeHandler(this.disposeHandler);


            return InnerSubscription.create(this, observer);



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
            //this._source && this._source.buildStream(this);
            //this.buildStream(this);

            this._isStart = true;
        }

        public remove(observer:Observer){
            this._observers.removeChild((ob:Observer) => {
                return JudgeUtils.isEqual(ob, observer);
            });
        }

        //public dispose(observer:Observer){
        public dispose(){
            //observer.dispose();
            //
            //this._observers.removeChild(observer);
            this._observers.forEach((ob:Observer) => {
                ob.dispose();
            });

            this._observers.removeAllChildren();
        }

        public subscribeCore(observer:IObserver){
            //var self = this;
            //
            //this.addDisposeHandler(() => {
            //    self.dispose();
            //});
        }

        public concat(subjectArr:Array<AsyncSubject>);
        public concat(...otherSubject);

        public concat(){
            var args = null;

            if(JudgeUtils.isArray(arguments[0])){
                args = arguments[0];
            }
            else{
                args = Array.prototype.slice.call(arguments, 0);
            }

            //todo check be AsyncSubject

            //return ConcatSubject.create(this, args);
            return new ConcatSubject(this, args);

            //return ConcatStream.create(this, args);
        }
    }

}
