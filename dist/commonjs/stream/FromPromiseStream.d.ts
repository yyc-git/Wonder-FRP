import { BaseStream } from "./BaseStream";
import { Scheduler } from "../core/Scheduler";
import { IObserver } from "../observer/IObserver";
import { SingleDisposable } from "../Disposable/SingleDisposable";
export declare class FromPromiseStream extends BaseStream {
    static create(promise: any, scheduler: Scheduler): FromPromiseStream;
    private _promise;
    constructor(promise: any, scheduler: Scheduler);
    subscribeCore(observer: IObserver): SingleDisposable;
}
