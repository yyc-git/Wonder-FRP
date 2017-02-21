import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { IgnoreElementsObserver } from "../observer/IgnoreElementsObserver";
import { IDisposable } from "../Disposable/IDisposable";
import { registerClass } from "../definition/typescript/decorator/registerClass";

@registerClass("IgnoreElementsStream")
export class IgnoreElementsStream extends BaseStream {
    public static create(source: Stream) {
        var obj = new this(source);

        return obj;
    }

    private _source: Stream = null;

    constructor(source: Stream) {
        super(null);

        this._source = source;

        this.scheduler = this._source.scheduler;
    }

    public subscribeCore(observer: IObserver) {
        return this._source.buildStream(IgnoreElementsObserver.create(observer));
    }
}
