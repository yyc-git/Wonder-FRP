import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { IDisposable } from "../Disposable/IDisposable";
import { Observer } from "../core/Observer";
import { Subject } from "../subject/Subject";
export declare abstract class BaseStream extends Stream {
    abstract subscribeCore(observer: IObserver): IDisposable;
    subscribe(arg1: Function | Observer | Subject, onError?: any, onCompleted?: any): IDisposable;
    buildStream(observer: IObserver): IDisposable;
}
