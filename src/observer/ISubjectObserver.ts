module wdFrp{
    export interface ISubjectObserver {
        addChild(observer:Observer);
        removeChild(observer:Observer);
    }
}
