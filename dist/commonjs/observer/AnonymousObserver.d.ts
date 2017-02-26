import { Observer } from "../core/Observer";
export declare class AnonymousObserver extends Observer {
    static create(onNext: Function, onError: Function, onCompleted: Function): AnonymousObserver;
    protected onNext(value: any): void;
    protected onError(error: any): void;
    protected onCompleted(): void;
}
