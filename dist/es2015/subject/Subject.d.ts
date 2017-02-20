import { IObserver } from "../observer/IObserver";
import { Stream } from "../core/Stream";
import { Observer } from "../core/Observer";
import { IDisposable } from "../Disposable/IDisposable";
export declare class Subject implements IObserver {
    static create(): Subject;
    private _source;
    source: Stream;
    private _observer;
    subscribe(arg1?: Function | Observer, onError?: Function, onCompleted?: Function): IDisposable;
    next(value: any): void;
    error(error: any): void;
    completed(): void;
    start(): void;
    remove(observer: Observer): void;
    dispose(): void;
}
