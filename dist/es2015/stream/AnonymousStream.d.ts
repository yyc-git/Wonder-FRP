import { Stream } from "../core/Stream";
import { Subject } from "../subject/Subject";
import { IDisposable } from "../Disposable/IDisposable";
import { IObserver } from "../observer/IObserver";
export declare class AnonymousStream extends Stream {
    static create(subscribeFunc: Function): AnonymousStream;
    constructor(subscribeFunc: Function);
    subscribe(subject: Subject): IDisposable;
    subscribe(observer: IObserver): IDisposable;
    subscribe(onNext: (value: any) => void): IDisposable;
    subscribe(onNext: (value: any) => void, onError: (e: any) => void): IDisposable;
    subscribe(onNext: (value: any) => void, onError: (e: any) => void, onComplete: () => void): IDisposable;
}
