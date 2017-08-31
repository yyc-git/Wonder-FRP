import { Observer } from "../core/Observer";
import { IObserver } from "./IObserver";
import { GroupDisposable } from "../Disposable/GroupDisposable";
export declare class MergeAllObserver extends Observer {
    static create(currentObserver: IObserver, groupDisposable: GroupDisposable): MergeAllObserver;
    constructor(currentObserver: IObserver, groupDisposable: GroupDisposable);
    done: boolean;
    currentObserver: IObserver;
    private _groupDisposable;
    protected onNext(innerSource: any): void;
    protected onError(error: any): void;
    protected onCompleted(): void;
}
