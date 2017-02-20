import { BaseStream } from "./BaseStream";
import { Scheduler } from "../core/Scheduler";
import { IObserver } from "../observer/IObserver";
import { SingleDisposable } from "../Disposable/SingleDisposable";
import { root } from "../global/Variable";

export class IntervalRequestStream extends BaseStream {
    public static create(scheduler: Scheduler) {
        var obj = new this(scheduler);

        return obj;
    }

    private _isEnd: boolean = false;

    constructor(scheduler: Scheduler) {
        super(null);

        this.scheduler = scheduler;
    }

    public subscribeCore(observer: IObserver) {
        var self = this;

        this.scheduler.publishIntervalRequest(observer, (time) => {
            observer.next(time);

            return self._isEnd;
        });

        return SingleDisposable.create(() => {
            root.cancelNextRequestAnimationFrame(self.scheduler.requestLoopId);
            self._isEnd = true;
        });
    }
}