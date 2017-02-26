import { FilterStream } from "./FilterStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { FilterWithStateObserver } from "../observer/FilterWithStateObserver";
export declare class FilterWithStateStream extends FilterStream {
    static create(source: Stream, predicate: (value: any, index?: number, source?: Stream) => boolean, thisArg: any): FilterWithStateStream;
    protected createObserver(observer: IObserver): FilterWithStateObserver;
    protected createStreamForInternalFilter(source: Stream, innerPredicate: any, thisArg: any): Stream;
}
