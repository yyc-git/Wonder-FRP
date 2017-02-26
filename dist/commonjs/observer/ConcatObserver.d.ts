import { Observer } from "../core/Observer";
import { IObserver } from "./IObserver";
export declare class ConcatObserver extends Observer {
    static create(currentObserver: IObserver, startNextStream: Function): ConcatObserver;
    protected currentObserver: any;
    private _startNextStream;
    constructor(currentObserver: IObserver, startNextStream: Function);
    protected onNext(value: any): void;
    protected onError(error: any): void;
    protected onCompleted(): void;
}
