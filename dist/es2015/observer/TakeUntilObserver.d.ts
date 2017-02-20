import { Observer } from "../core/Observer";
import { IObserver } from "./IObserver";
export declare class TakeUntilObserver extends Observer {
    static create(prevObserver: IObserver): TakeUntilObserver;
    private _prevObserver;
    constructor(prevObserver: IObserver);
    protected onNext(value: any): void;
    protected onError(error: any): void;
    protected onCompleted(): void;
}
