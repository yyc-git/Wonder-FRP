import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { GroupDisposable } from "../Disposable/GroupDisposable";
export declare class ConcatStream extends BaseStream {
    static create(sources: Array<Stream>): ConcatStream;
    private _sources;
    constructor(sources: Array<Stream>);
    subscribeCore(observer: IObserver): GroupDisposable;
}
