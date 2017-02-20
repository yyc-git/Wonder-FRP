import { Observer } from "../core/Observer";
import { IObserver } from "./IObserver";
import { Stream } from "../core/Stream";
export declare class FilterObserver extends Observer {
    static create(prevObserver: IObserver, predicate: (value: any, index?: number, source?: Stream) => boolean, source: Stream): FilterObserver;
    constructor(prevObserver: IObserver, predicate: (value: any) => boolean, source: Stream);
    protected prevObserver: IObserver;
    protected source: Stream;
    protected i: number;
    protected predicate: (value: any, index?: number, source?: Stream) => boolean;
    protected onNext(value: any): void;
    protected onError(error: any): void;
    protected onCompleted(): void;
}
