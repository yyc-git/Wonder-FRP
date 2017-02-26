import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { IDisposable } from "../Disposable/IDisposable";
export declare class IgnoreElementsStream extends BaseStream {
    static create(source: Stream): IgnoreElementsStream;
    private _source;
    constructor(source: Stream);
    subscribeCore(observer: IObserver): IDisposable;
}
