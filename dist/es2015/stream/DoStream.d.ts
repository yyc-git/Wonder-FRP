import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { IDisposable } from "../Disposable/IDisposable";
export declare class DoStream extends BaseStream {
    static create(source: Stream, onNext?: Function, onError?: Function, onCompleted?: Function): DoStream;
    private _source;
    private _observer;
    constructor(source: Stream, onNext: Function, onError: Function, onCompleted: Function);
    subscribeCore(observer: IObserver): IDisposable;
}
