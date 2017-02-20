import { Observer } from "../core/Observer";
import { TestScheduler } from "./TestScheduler";
import { Record } from "./Record";
export declare class MockObserver extends Observer {
    static create(scheduler: TestScheduler): MockObserver;
    private _messages;
    messages: [Record];
    private _scheduler;
    constructor(scheduler: TestScheduler);
    protected onNext(value: any): void;
    protected onError(error: any): void;
    protected onCompleted(): void;
    dispose(): void;
    clone(): MockObserver;
}
