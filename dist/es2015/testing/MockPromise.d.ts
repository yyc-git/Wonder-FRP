import { TestScheduler } from "./TestScheduler";
import { Record } from "./Record";
import { IObserver } from "../observer/IObserver";
export declare class MockPromise {
    static create(scheduler: TestScheduler, messages: [Record]): MockPromise;
    private _messages;
    private _scheduler;
    constructor(scheduler: TestScheduler, messages: [Record]);
    then(successCb: Function, errorCb: Function, observer: IObserver): void;
}
