import { FilterObserver } from "./FilterObserver";
import { IObserver } from "./IObserver";
import { Stream } from "../core/Stream";
export declare class FilterWithStateObserver extends FilterObserver {
    static create(prevObserver: IObserver, predicate: (value: any, index?: number, source?: Stream) => boolean, source: Stream): FilterWithStateObserver;
    private _isTrigger;
    protected onNext(value: any): void;
}
