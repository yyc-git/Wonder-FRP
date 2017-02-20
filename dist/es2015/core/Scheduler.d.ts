import { IObserver } from "../observer/IObserver";
export declare class Scheduler {
    static create(...args: any[]): Scheduler;
    private _requestLoopId;
    requestLoopId: any;
    publishRecursive(observer: IObserver, initial: any, action: Function): void;
    publishInterval(observer: IObserver, initial: any, interval: number, action: Function): number;
    publishIntervalRequest(observer: IObserver, action: Function): void;
    publishTimeout(observer: IObserver, time: number, action: Function): number;
}
