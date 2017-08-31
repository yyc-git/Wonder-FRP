import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { MergeAllObserver } from "../observer/MergeAllObserver";
import { registerClass } from "../definition/typescript/decorator/registerClass";

@registerClass("MergeAllStream")
export class MergeAllStream extends BaseStream {
    public static create(source: Stream) {
        var obj = new this(source);

        return obj;
    }

    constructor(source: Stream) {
        super(null);

        this._source = source;

        this.scheduler = this._source.scheduler;
    }

    private _source: Stream = null;

    public subscribeCore(observer: IObserver) {
        var groupDisposable = GroupDisposable.create();

        groupDisposable.add(this._source.buildStream(MergeAllObserver.create(observer, groupDisposable)));

        return groupDisposable;
    }
}
