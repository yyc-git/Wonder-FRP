import { IObserver } from "./IObserver";
import { Collection } from "wonder-commonlib/dist/es2015/Collection";
import { IDisposable } from "../Disposable/IDisposable";
import { Observer } from "../core/Observer";
export declare class SubjectObserver implements IObserver {
    observers: Collection<IObserver>;
    private _disposable;
    isEmpty(): boolean;
    next(value: any): void;
    error(error: any): void;
    completed(): void;
    addChild(observer: Observer): void;
    removeChild(observer: Observer): void;
    dispose(): void;
    setDisposable(disposable: IDisposable): void;
}
