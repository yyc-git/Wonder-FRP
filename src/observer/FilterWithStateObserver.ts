import { FilterObserver } from "./FilterObserver";
import { IObserver } from "./IObserver";
import { Stream } from "../core/Stream";
import { FilterState } from "../enum/FilterState";

export class FilterWithStateObserver extends FilterObserver {
    public static create(prevObserver: IObserver, predicate: (value: any, index?: number, source?: Stream) => boolean, source: Stream) {
        return new this(prevObserver, predicate, source);
    }

    private _isTrigger: boolean = false;

    protected onNext(value) {
        var data: { value: any, state: FilterState } = null;

        try {
            if (this.predicate(value, this.i++, this.source)) {
                if (!this._isTrigger) {
                    data = {
                        value: value,
                        state: FilterState.ENTER
                    };
                }
                else {
                    data = {
                        value: value,
                        state: FilterState.TRIGGER
                    };
                }

                this.prevObserver.next(data);

                this._isTrigger = true;
            }
            else {
                if (this._isTrigger) {
                    data = {
                        value: value,
                        state: FilterState.LEAVE
                    };

                    this.prevObserver.next(data);
                }

                this._isTrigger = false;
            }
        }
        catch (e) {
            this.prevObserver.error(e);
        }
    }
}