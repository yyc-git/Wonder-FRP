import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { Observer } from "../core/Observer";
import { IDisposable } from "../Disposable/IDisposable";
export declare class FilterStream extends BaseStream {
    static create(source: Stream, predicate: (value: any, index?: number, source?: Stream) => boolean, thisArg: any): FilterStream;
    constructor(source: Stream, predicate: (value: any, index?: number, source?: Stream) => boolean, thisArg: any);
    predicate: (value: any, index?: number, source?: Stream) => boolean;
    private _source;
    subscribeCore(observer: IObserver): IDisposable;
    internalFilter(predicate: (value: any, index?: number, source?: Stream) => boolean, thisArg: any): Stream;
    protected createObserver(observer: IObserver): Observer;
    protected createStreamForInternalFilter(source: Stream, innerPredicate: any, thisArg: any): Stream;
    private _innerPredicate(predicate, self);
}
