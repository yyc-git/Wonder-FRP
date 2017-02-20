import { BaseStream } from "./BaseStream";
import { Scheduler } from "../core/Scheduler";
import { IObserver } from "../observer/IObserver";
import { SingleDisposable } from "../Disposable/SingleDisposable";
export declare class TimeoutStream extends BaseStream {
    static create(time: number, scheduler: Scheduler): TimeoutStream;
    private _time;
    constructor(time: number, scheduler: Scheduler);
    subscribeCore(observer: IObserver): SingleDisposable;
}
