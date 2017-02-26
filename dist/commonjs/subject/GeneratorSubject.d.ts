import { Entity } from "../core/Entity";
import { IObserver } from "../observer/IObserver";
import { Observer } from "../core/Observer";
import { IDisposable } from "../Disposable/IDisposable";
export declare class GeneratorSubject extends Entity implements IObserver {
    static create(): GeneratorSubject;
    private _isStart;
    isStart: boolean;
    constructor();
    observer: any;
    onBeforeNext(value: any): void;
    onAfterNext(value: any): void;
    onIsCompleted(value: any): boolean;
    onBeforeError(error: any): void;
    onAfterError(error: any): void;
    onBeforeCompleted(): void;
    onAfterCompleted(): void;
    subscribe(arg1?: Function | Observer, onError?: Function, onCompleted?: Function): IDisposable;
    next(value: any): void;
    error(error: any): void;
    completed(): void;
    toStream(): any;
    start(): void;
    stop(): void;
    remove(observer: Observer): void;
    dispose(): void;
}
