import { Observer } from "../core/Observer";
import { IObserver } from "./IObserver";
export declare class IgnoreElementsObserver extends Observer {
    static create(currentObserver: IObserver): IgnoreElementsObserver;
    private _currentObserver;
    constructor(currentObserver: IObserver);
    protected onNext(value: any): void;
    protected onError(error: any): void;
    protected onCompleted(): void;
}
