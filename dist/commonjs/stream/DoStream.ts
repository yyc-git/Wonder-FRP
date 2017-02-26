import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { Observer } from "../core/Observer";
import { AnonymousObserver } from "../observer/AnonymousObserver";
import { IObserver } from "../observer/IObserver";
import { DoObserver } from "../observer/DoObserver";
import { IDisposable } from "../Disposable/IDisposable";
import { registerClass } from "../definition/typescript/decorator/registerClass";

@registerClass("DoStream")
export class DoStream extends BaseStream {
    public static create(source: Stream, onNext?: Function, onError?: Function, onCompleted?: Function) {
        var obj = new this(source, onNext, onError, onCompleted);

        return obj;
    }

    private _source: Stream = null;
    private _observer: Observer = null;

    constructor(source: Stream, onNext: Function, onError: Function, onCompleted: Function) {
        super(null);

        this._source = source;
        this._observer = AnonymousObserver.create(onNext, onError, onCompleted);

        this.scheduler = this._source.scheduler;
    }

    public subscribeCore(observer: IObserver) {
        return this._source.buildStream(DoObserver.create(observer, this._observer));
    }
}
