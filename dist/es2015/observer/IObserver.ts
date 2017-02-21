import { IDisposable } from "../Disposable/IDisposable";

export interface IObserver extends IDisposable {
    next(value: any);
    error(error: any);
    completed();
}