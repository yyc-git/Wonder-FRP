/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class SubjectObserver implements IObserver{
        public observers:dyCb.Collection<IObserver> = dyCb.Collection.create<IObserver>();

        private _disposable:IDisposable = null;

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

            observer.setDisposable(this._disposable);
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

        public setDisposable(disposable:IDisposable){
            this.observers.forEach((observer:Observer) => {
                observer.setDisposable(disposable);
            });

            this._disposable = disposable;
        }
    }

}
