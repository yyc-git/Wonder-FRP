import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { IDisposable } from "../Disposable/IDisposable";
export declare class MapStream extends BaseStream {
    static create(source: Stream, selector: Function): MapStream;
    private _source;
    private _selector;
    constructor(source: Stream, selector: Function);
    subscribeCore(observer: IObserver): IDisposable;
}
