import { BaseStream } from "../stream/BaseStream";
import { Record } from "./Record";
import { TestScheduler } from "./TestScheduler";
import { IObserver } from "../observer/IObserver";
import { SingleDisposable } from "../Disposable/SingleDisposable";
export declare class TestStream extends BaseStream {
    static create(messages: [Record], scheduler: TestScheduler): TestStream;
    scheduler: TestScheduler;
    private _messages;
    constructor(messages: [Record], scheduler: TestScheduler);
    subscribeCore(observer: IObserver): SingleDisposable;
}
