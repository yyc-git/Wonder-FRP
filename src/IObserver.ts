module dyRt{
    export interface IObserver{
        next(value);
        error(error);
        completed();
        dispose();

    }
}
