import { Stream } from "../core/Stream";
import { Scheduler } from "../core/Scheduler";
import { Subject } from "../subject/Subject";
import { IDisposable } from "../Disposable/IDisposable";
import { IObserver } from "../observer/IObserver";
import { AutoDetachObserver } from "../observer/AutoDetachObserver";
import { JudgeUtils } from "../JudgeUtils";

export class AnonymousStream extends Stream {
    public static create(subscribeFunc: Function) {
        var obj = new this(subscribeFunc);

        return obj;
    }

    constructor(subscribeFunc: Function) {
        super(subscribeFunc);

        this.scheduler = Scheduler.create();
    }

    public subscribe(subject: Subject): IDisposable;
    public subscribe(observer: IObserver): IDisposable;

    public subscribe(onNext: (value: any) => void): IDisposable;
    public subscribe(onNext: (value: any) => void, onError: (e: any) => void): IDisposable;
    public subscribe(onNext: (value: any) => void, onError: (e: any) => void, onComplete: () => void): IDisposable;

    public subscribe(...args): IDisposable {
        var observer: AutoDetachObserver = null;

        if (args[0] instanceof Subject) {
            let subject: Subject = <Subject>args[0];

            this.handleSubject(subject);

            return;
        }
        else if (JudgeUtils.isIObserver(<IObserver>args[0])) {
            observer = AutoDetachObserver.create(<IObserver>args[0]);
        }
        else {
            let onNext: Function = <Function>args[0],
                onError: Function = <Function>args[1] || null,
                onCompleted: Function = <Function>args[2] || null;

            observer = AutoDetachObserver.create(onNext, onError, onCompleted);
        }

        observer.setDisposable(this.buildStream(observer));

        return observer;
    }
}