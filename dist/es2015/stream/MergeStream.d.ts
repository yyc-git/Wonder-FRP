import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { GroupDisposable } from "../Disposable/GroupDisposable";
export declare class MergeStream extends BaseStream {
    static create(source: Stream, maxConcurrent: number): MergeStream;
    constructor(source: Stream, maxConcurrent: number);
    private _source;
    private _maxConcurrent;
    subscribeCore(observer: IObserver): GroupDisposable;
}
