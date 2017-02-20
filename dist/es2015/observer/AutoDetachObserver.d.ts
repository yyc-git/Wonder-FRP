import { Observer } from "../core/Observer";
import { IObserver } from "./IObserver";
export declare class AutoDetachObserver extends Observer {
    static create(observer: IObserver): any;
    static create(onNext: Function, onError: Function, onCompleted: Function): any;
    dispose(): void;
    protected onNext(value: any): void;
    protected onError(error: any): void;
    protected onCompleted(): void;
}
