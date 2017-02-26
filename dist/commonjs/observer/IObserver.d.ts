import { IDisposable } from "../Disposable/IDisposable";
export interface IObserver extends IDisposable {
    next(value: any): any;
    error(error: any): any;
    completed(): any;
}
