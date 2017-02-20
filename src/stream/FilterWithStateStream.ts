import { FilterStream } from "./FilterStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { FilterWithStateObserver } from "../observer/FilterWithStateObserver";

export class FilterWithStateStream extends FilterStream {
    public static create(source: Stream, predicate: (value: any, index?: number, source?: Stream) => boolean, thisArg: any) {
        var obj = new this(source, predicate, thisArg);

        return obj;
    }

    protected createObserver(observer: IObserver) {
        return FilterWithStateObserver.create(observer, this.predicate, this);
    }

    protected createStreamForInternalFilter(source: Stream, innerPredicate: any, thisArg: any): Stream {
        return FilterWithStateStream.create(source, innerPredicate, thisArg);
    }
}