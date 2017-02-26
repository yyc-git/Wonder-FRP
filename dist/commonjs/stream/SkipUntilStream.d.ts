import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { GroupDisposable } from "../Disposable/GroupDisposable";
export declare class SkipUntilStream extends BaseStream {
    static create(source: Stream, otherSteam: Stream): SkipUntilStream;
    isOpen: boolean;
    private _source;
    private _otherStream;
    constructor(source: Stream, otherStream: Stream);
    subscribeCore(observer: IObserver): GroupDisposable;
}
