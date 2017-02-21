import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { Collection } from "wonder-commonlib/dist/es2015/Collection";
import { JudgeUtils } from "../JudgeUtils";
import { fromPromise } from "../global/Operator";
import { IObserver } from "../observer/IObserver";
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { ConcatObserver } from "../observer/ConcatObserver";
import { ClassMapUtils } from "../utils/ClassMapUtils";
import { registerClass } from "../definition/typescript/decorator/registerClass";

@registerClass("ConcatStream")
export class ConcatStream extends BaseStream {
    public static create(sources: Array<Stream>) {
        var obj = new this(sources);

        return obj;
    }

    private _sources: Collection<Stream> = Collection.create<Stream>();

    constructor(sources: Array<Stream>) {
        super(null);

        var self = this;

        //todo don't set scheduler here?
        this.scheduler = sources[0].scheduler;

        sources.forEach((source) => {
            if (JudgeUtils.isPromise(source)) {
                self._sources.addChild(fromPromise(source));
            }
            else {
                self._sources.addChild(source);
            }
        });
    }

    public subscribeCore(observer: IObserver) {
        var self = this,
            count = this._sources.getCount(),
            d = GroupDisposable.create();

        function loopRecursive(i) {
            if (i === count) {
                observer.completed();

                return;
            }

            d.add(self._sources.getChild(i).buildStream(ConcatObserver.create(
                observer, () => {
                    loopRecursive(i + 1);
                })
            ));
        }

        this.scheduler.publishRecursive(observer, 0, loopRecursive);

        return GroupDisposable.create(d);
    }
}
