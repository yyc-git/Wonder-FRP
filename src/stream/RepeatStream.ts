import { BaseStream } from "./BaseStream";
import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { ConcatObserver } from "../observer/ConcatObserver";
import { registerClass } from "../definition/typescript/decorator/registerClass";

@registerClass("RepeatStream")
export class RepeatStream extends BaseStream {
    public static create(source: Stream, count: number) {
        var obj = new this(source, count);

        return obj;
    }

    private _source: Stream = null;
    private _count: number = null;

    constructor(source: Stream, count: number) {
        super(null);

        this._source = source;
        this._count = count;

        this.scheduler = this._source.scheduler;

        //this.subjectGroup = this._source.subjectGroup;
    }

    public subscribeCore(observer: IObserver) {
        var self = this,
            d = GroupDisposable.create();

        function loopRecursive(count) {
            if (count === 0) {
                observer.completed();

                return;
            }

            d.add(
                self._source.buildStream(ConcatObserver.create(observer, () => {
                    loopRecursive(count - 1);
                }))
            );
        }


        this.scheduler.publishRecursive(observer, this._count, loopRecursive);

        return GroupDisposable.create(d);
    }
}
