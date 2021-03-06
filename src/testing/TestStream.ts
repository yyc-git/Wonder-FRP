import { BaseStream } from "../stream/BaseStream";
import { Record } from "./Record";
import { TestScheduler } from "./TestScheduler";
import { IObserver } from "../observer/IObserver";
import { SingleDisposable } from "../Disposable/SingleDisposable";

export class TestStream extends BaseStream {
    public static create(messages: [Record], scheduler: TestScheduler) {
        var obj = new this(messages, scheduler);

        return obj;
    }

    public scheduler: TestScheduler = null;
    private _messages: [Record] = null;

    constructor(messages: [Record], scheduler: TestScheduler) {
        super(null);

        this._messages = messages;
        this.scheduler = scheduler;
    }

    public subscribeCore(observer: IObserver) {
        //var scheduler = <TestScheduler>(this.scheduler);

        this.scheduler.setStreamMap(observer, this._messages);

        return SingleDisposable.create();
    }
}