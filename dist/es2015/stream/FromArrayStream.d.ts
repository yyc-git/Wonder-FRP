import { BaseStream } from "./BaseStream";
import { Scheduler } from "../core/Scheduler";
import { IObserver } from "../observer/IObserver";
import { SingleDisposable } from "../Disposable/SingleDisposable";
export declare class FromArrayStream extends BaseStream {
    static create(array: Array<any>, scheduler: Scheduler): FromArrayStream;
    private _array;
    constructor(array: Array<any>, scheduler: Scheduler);
    subscribeCore(observer: IObserver): SingleDisposable;
}
