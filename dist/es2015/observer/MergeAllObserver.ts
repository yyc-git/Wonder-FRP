import { Log } from "wonder-commonlib/dist/es2015/Log";
import { Observer } from "../core/Observer";
import { IObserver } from "./IObserver";
import { Collection } from "wonder-commonlib/dist/es2015/Collection";
import { Stream } from "../core/Stream";
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { require, assert } from "../definition/typescript/decorator/contract";
import { JudgeUtils } from "../JudgeUtils";
import { fromPromise } from "../global/Operator";

export class MergeAllObserver extends Observer {
    public static create(currentObserver: IObserver, streamGroup: Collection<Stream>, groupDisposable: GroupDisposable) {
        return new this(currentObserver, streamGroup, groupDisposable);
    }

    constructor(currentObserver: IObserver, streamGroup: Collection<Stream>, groupDisposable: GroupDisposable) {
        super(null, null, null);

        this.currentObserver = currentObserver;
        this._streamGroup = streamGroup;
        this._groupDisposable = groupDisposable;
    }

    public done: boolean = false;
    public currentObserver: IObserver = null;

    private _streamGroup: Collection<Stream> = null;
    private _groupDisposable: GroupDisposable = null;

    @require(function(innerSource: any) {
        assert(innerSource instanceof Stream || JudgeUtils.isPromise(innerSource), Log.info.FUNC_MUST_BE("innerSource", "Stream or Promise"));

    })
    protected onNext(innerSource: any) {
        if (JudgeUtils.isPromise(innerSource)) {
            innerSource = fromPromise(innerSource);
        }

        this._streamGroup.addChild(innerSource);

        this._groupDisposable.add(innerSource.buildStream(InnerObserver.create(this, this._streamGroup, innerSource)));
    }

    protected onError(error) {
        this.currentObserver.error(error);
    }

    protected onCompleted() {
        this.done = true;

        if (this._streamGroup.getCount() === 0) {
            this.currentObserver.completed();
        }
    }
}

class InnerObserver extends Observer {
    public static create(parent: MergeAllObserver, streamGroup: Collection<Stream>, currentStream: Stream) {
        var obj = new this(parent, streamGroup, currentStream);

        return obj;
    }

    constructor(parent: MergeAllObserver, streamGroup: Collection<Stream>, currentStream: Stream) {
        super(null, null, null);

        this._parent = parent;
        this._streamGroup = streamGroup;
        this._currentStream = currentStream;
    }

    private _parent: MergeAllObserver = null;
    private _streamGroup: Collection<Stream> = null;
    private _currentStream: Stream = null;

    protected onNext(value) {
        this._parent.currentObserver.next(value);
    }

    protected onError(error) {
        this._parent.currentObserver.error(error);
    }

    protected onCompleted() {
        var currentStream = this._currentStream,
            parent = this._parent;

        this._streamGroup.removeChild((stream: Stream) => {
            return JudgeUtils.isEqual(stream, currentStream);
        });

        //parent.currentObserver.completed();
        //this.dispose();

        /*!
        if this innerSource is async stream(as promise stream),
        it will first exec all parent.next and one parent.completed,
        then exec all this.next and all this.completed
        so in this case, it should invoke parent.currentObserver.completed after the last invokcation of this.completed(have invoked all the innerSource)
        */
        if (this._isAsync() && this._streamGroup.getCount() === 0) {
            parent.currentObserver.completed();
        }
    }

    private _isAsync() {
        return this._parent.done;
    }
}