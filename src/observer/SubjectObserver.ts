/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class SubjectObserver implements IObserver{
        public observers:dyCb.Collection<IObserver> = dyCb.Collection.create<IObserver>();

        public isEmpty(){
            return this.observers.getCount() === 0;
        }

        public next(value:any){
            this.observers.forEach((ob:Observer) => {
                ob.next(value);
            });
        }

        public error(error:any){
            this.observers.forEach((ob:Observer) => {
                ob.error(error);
            });
        }

        public completed(){
            this.observers.forEach((ob:Observer) => {
                ob.completed();
            });
        }

        public addChild(observer:Observer){
            this.observers.addChild(observer);
        }

        public removeChild(observer:Observer){
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

        public setDisposeHandler(){
            this.observers.forEach((observer:Observer) => {
                observer.setDisposeHandler(Disposer.getDisposeHandler());
            });

            Disposer.removeAllDisposeHandler();
        }
    }

}
