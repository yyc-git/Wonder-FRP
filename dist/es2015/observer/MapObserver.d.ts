import { Observer } from "../core/Observer";
import { IObserver } from "./IObserver";
export declare class MapObserver extends Observer {
    static create(currentObserver: IObserver, selector: Function): MapObserver;
    private _currentObserver;
    private _selector;
    constructor(currentObserver: IObserver, selector: Function);
    protected onNext(value: any): void;
    protected onError(error: any): void;
    protected onCompleted(): void;
}
