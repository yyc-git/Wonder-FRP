module dyRt{
    export class SubjectObserver implements IObserver{
        public observers:dyCb.Collection<IObserver> = dyCb.Collection.create<IObserver>();

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

        public addChild(observer:IObserver){
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
    }

}
