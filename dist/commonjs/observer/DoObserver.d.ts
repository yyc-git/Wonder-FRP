import { Observer } from "../core/Observer";
import { IObserver } from "./IObserver";
export declare class DoObserver extends Observer {
    static create(currentObserver: IObserver, prevObserver: IObserver): DoObserver;
    private _currentObserver;
    private _prevObserver;
    constructor(currentObserver: IObserver, prevObserver: IObserver);
    protected onNext(value: any): void;
    protected onError(error: any): void;
    protected onCompleted(): void;
}
