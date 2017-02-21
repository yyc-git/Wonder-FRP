import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { MapObserver } from "../observer/MapObserver";
import { IDisposable } from "../Disposable/IDisposable";
import { registerClass } from "../definition/typescript/decorator/registerClass";

@registerClass("MapStream")
export class MapStream extends BaseStream {
    public static create(source: Stream, selector: Function) {
        var obj = new this(source, selector);

        return obj;
    }

    private _source: Stream = null;
    private _selector: Function = null;

    constructor(source: Stream, selector: Function) {
        super(null);

        this._source = source;

        this.scheduler = this._source.scheduler;
        this._selector = selector;
    }

    public subscribeCore(observer: IObserver) {
        return this._source.buildStream(MapObserver.create(observer, this._selector));
    }
}
