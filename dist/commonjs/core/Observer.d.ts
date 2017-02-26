import { Entity } from "./Entity";
import { IObserver } from "../observer/IObserver";
import { IDisposable } from "../Disposable/IDisposable";
export declare abstract class Observer extends Entity implements IObserver {
    private _isDisposed;
    isDisposed: boolean;
    protected onUserNext: Function;
    protected onUserError: Function;
    protected onUserCompleted: Function;
    private _isStop;
    private _disposable;
    constructor(observer: IObserver);
    constructor(onNext: Function, onError: Function, onCompleted: Function);
    next(value: any): any;
    error(error: any): void;
    completed(): void;
    dispose(): void;
    setDisposable(disposable: IDisposable): void;
    protected abstract onNext(value: any): any;
    protected abstract onError(error: any): any;
    protected abstract onCompleted(): any;
}
