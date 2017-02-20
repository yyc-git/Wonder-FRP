import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { GroupDisposable } from "../Disposable/GroupDisposable";
export declare class MergeAllStream extends BaseStream {
    static create(source: Stream): MergeAllStream;
    constructor(source: Stream);
    private _source;
    private _observer;
    subscribeCore(observer: IObserver): GroupDisposable;
}
