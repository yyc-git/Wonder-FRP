/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class ConcatSubjectObserver extends ConcatObserver implements ISubjectObserver{
        public addChild(observer:Observer){
            this.currentObserver.addChild(observer);
        }

        public removeChild(observer:Observer){
            this.currentObserver.removeChild(observer);
        }
    }
}
