import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { GroupDisposable } from "../Disposable/GroupDisposable";
export declare class RepeatStream extends BaseStream {
    static create(source: Stream, count: number): RepeatStream;
    private _source;
    private _count;
    constructor(source: Stream, count: number);
    subscribeCore(observer: IObserver): GroupDisposable;
}
