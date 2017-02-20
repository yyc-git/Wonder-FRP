import { Observer } from "../core/Observer";
import { IObserver } from "./IObserver";
import { SkipUntilStream } from "../stream/SkipUntilStream";
export declare class SkipUntilSourceObserver extends Observer {
    static create(prevObserver: IObserver, skipUntilStream: SkipUntilStream): SkipUntilSourceObserver;
    private _prevObserver;
    private _skipUntilStream;
    constructor(prevObserver: IObserver, skipUntilStream: SkipUntilStream);
    protected onNext(value: any): void;
    protected onError(error: any): void;
    protected onCompleted(): void;
}
