/// <reference types="wonder-commonlib" />
import { Observer } from "../core/Observer";
import { IObserver } from "./IObserver";
import { Collection } from "wonder-commonlib/dist/commonjs/Collection";
import { Stream } from "../core/Stream";
import { GroupDisposable } from "../Disposable/GroupDisposable";
export declare class MergeObserver extends Observer {
    static create(currentObserver: IObserver, maxConcurrent: number, streamGroup: Collection<Stream>, groupDisposable: GroupDisposable): MergeObserver;
    constructor(currentObserver: IObserver, maxConcurrent: number, streamGroup: Collection<Stream>, groupDisposable: GroupDisposable);
    done: boolean;
    currentObserver: IObserver;
    activeCount: number;
    q: Array<Stream>;
    private _maxConcurrent;
    private _groupDisposable;
    private _streamGroup;
    handleSubscribe(innerSource: any): void;
    protected onNext(innerSource: any): void;
    protected onError(error: any): void;
    protected onCompleted(): void;
    private _isReachMaxConcurrent();
}
