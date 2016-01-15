module wdFrp{
    export interface IObserver extends IDisposable{
        next(value:any, ...args);
        error(error:any);
        completed();
    }
}
