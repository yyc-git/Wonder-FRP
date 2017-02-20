import { BaseStream } from "./BaseStream";
import { Scheduler } from "../core/Scheduler";
import { IObserver } from "../observer/IObserver";
import { SingleDisposable } from "../Disposable/SingleDisposable";
export declare class IntervalRequestStream extends BaseStream {
    static create(scheduler: Scheduler): IntervalRequestStream;
    private _isEnd;
    constructor(scheduler: Scheduler);
    subscribeCore(observer: IObserver): SingleDisposable;
}
