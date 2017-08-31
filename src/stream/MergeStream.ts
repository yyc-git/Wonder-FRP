import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { MergeObserver } from "../observer/MergeObserver";
import { registerClass } from "../definition/typescript/decorator/registerClass";

@registerClass("MergeStream")
export class MergeStream extends BaseStream {
    public static create(source: Stream, maxConcurrent: number) {
        var obj = new this(source, maxConcurrent);

        return obj;
    }

    constructor(source: Stream, maxConcurrent: number) {
        super(null);

        this._source = source;
        this._maxConcurrent = maxConcurrent;

        this.scheduler = this._source.scheduler;
    }

    private _source: Stream = null;
    private _maxConcurrent: number = null;

    public subscribeCore(observer: IObserver) {
        var groupDisposable = GroupDisposable.create();

        groupDisposable.add(this._source.buildStream(MergeObserver.create(observer, this._maxConcurrent, groupDisposable)));

        return groupDisposable;
    }
}
