import { IObserver } from "../observer/IObserver";
import { interval } from "../global/Operator";
import { root } from "../global/Variable";

export class Scheduler {
    //todo remove "...args"
    public static create(...args) {
        var obj = new this();

        return obj;
    }

    private _requestLoopId: any = null;
    get requestLoopId() {
        return this._requestLoopId;
    }
    set requestLoopId(requestLoopId: any) {
        this._requestLoopId = requestLoopId;
    }

    //param observer is used by TestScheduler to rewrite

    public publishRecursive(observer: IObserver, initial: any, action: Function) {
        action(initial);
    }

    public publishInterval(observer: IObserver, initial: any, interval: number, action: Function): number {
        return root.setInterval(() => {
            initial = action(initial);
        }, interval);
    }

    public publishIntervalRequest(observer: IObserver, action: Function) {
        var self = this,
            loop = (time) => {
                var isEnd = action(time);

                if (isEnd) {
                    return;
                }

                self._requestLoopId = root.requestNextAnimationFrame(loop);
            };

        this._requestLoopId = root.requestNextAnimationFrame(loop);
    }

    public publishTimeout(observer: IObserver, time: number, action: Function): number {
        return root.setTimeout(() => {
            action(time);
            observer.completed();
        }, time);
    }
}