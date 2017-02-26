import { BaseStream } from "./BaseStream";
import { Scheduler } from "../core/Scheduler";
import { IObserver } from "../observer/IObserver";
import { SingleDisposable } from "../Disposable/SingleDisposable";
export declare class IntervalStream extends BaseStream {
    static create(interval: number, scheduler: Scheduler): IntervalStream;
    private _interval;
    constructor(interval: number, scheduler: Scheduler);
    initWhenCreate(): void;
    subscribeCore(observer: IObserver): SingleDisposable;
}
