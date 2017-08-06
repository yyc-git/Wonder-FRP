import { Observer } from "../core/Observer";
import { IObserver } from "./IObserver";
import { Collection } from "wonder-commonlib/dist/commonjs/Collection";
import { Stream } from "../core/Stream";
import { GroupDisposable } from "../Disposable/GroupDisposable";
export declare class MergeAllObserver extends Observer {
    static create(currentObserver: IObserver, streamGroup: Collection<Stream>, groupDisposable: GroupDisposable): MergeAllObserver;
    constructor(currentObserver: IObserver, streamGroup: Collection<Stream>, groupDisposable: GroupDisposable);
    done: boolean;
    currentObserver: IObserver;
    private _streamGroup;
    private _groupDisposable;
    protected onNext(innerSource: any): void;
    protected onError(error: any): void;
    protected onCompleted(): void;
}
