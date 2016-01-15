module wdFrp{
    export interface IObserver extends IDisposable{
        next(value:any);
        error(error:any);
        completed();
    }
}
