import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { Observer } from "../core/Observer";
import { IObserver } from "../observer/IObserver";
import { Collection } from "wonder-commonlib/dist/es2015/Collection";
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { MergeAllObserver } from "../observer/MergeAllObserver";

export class MergeAllStream extends BaseStream {
    public static create(source: Stream) {
        var obj = new this(source);

        return obj;
    }

    constructor(source: Stream) {
        super(null);

        this._source = source;
        //this._observer = AnonymousObserver.create(onNext, onError,onCompleted);

        this.scheduler = this._source.scheduler;
    }

    private _source: Stream = null;
    private _observer: Observer = null;

    public subscribeCore(observer: IObserver) {
        var streamGroup = Collection.create<Stream>(),
            groupDisposable = GroupDisposable.create();

        this._source.buildStream(MergeAllObserver.create(observer, streamGroup, groupDisposable));

        return groupDisposable;
    }
}