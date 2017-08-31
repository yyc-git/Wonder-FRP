import { Log } from "wonder-commonlib/dist/commonjs/Log";
import { Observer } from "../core/Observer";
import { IObserver } from "./IObserver";
import { Stream } from "../core/Stream";
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { JudgeUtils } from "../JudgeUtils";
import { fromPromise } from "../global/Operator";
import { requireCheck, assert } from "../definition/typescript/decorator/contract";
import { SingleDisposable } from "../Disposable/SingleDisposable";

export class MergeObserver extends Observer {
    public static create(currentObserver: IObserver, maxConcurrent: number, groupDisposable: GroupDisposable) {
        return new this(currentObserver, maxConcurrent, groupDisposable);
    }

    constructor(currentObserver: IObserver, maxConcurrent: number, groupDisposable: GroupDisposable) {
        super(null, null, null);

        this.currentObserver = currentObserver;
        this._maxConcurrent = maxConcurrent;
        this._groupDisposable = groupDisposable;
    }

    public done: boolean = false;
    public currentObserver: IObserver = null;
    public activeCount: number = 0;
    public q: Array<Stream> = [];

    private _maxConcurrent: number = null;
    private _groupDisposable: GroupDisposable = null;

    public handleSubscribe(innerSource: any) {
        if (JudgeUtils.isPromise(innerSource)) {
            innerSource = fromPromise(innerSource);
        }

        let disposable = SingleDisposable.create(),
            innerObserver = InnerObserver.create(this, innerSource, this._groupDisposable);

        this._groupDisposable.add(disposable);

        innerObserver.disposable = disposable;

        disposable.setDispose(innerSource.buildStream(innerObserver));
    }

    @requireCheck(function(innerSource: any) {
        assert(innerSource instanceof Stream || JudgeUtils.isPromise(innerSource), Log.info.FUNC_MUST_BE("innerSource", "Stream or Promise"));

    })
    protected onNext(innerSource: any) {
        if (this._isNotReachMaxConcurrent()) {
            this.activeCount++;
            this.handleSubscribe(innerSource);

            return;
        }

        this.q.push(innerSource);
    }

    protected onError(error) {
        this.currentObserver.error(error);
    }

    protected onCompleted() {
        this.done = true;

        if (this.activeCount === 0) {
            this.currentObserver.completed();
        }
    }

    private _isNotReachMaxConcurrent() {
        return this.activeCount < this._maxConcurrent;
    }
}

class InnerObserver extends Observer {
    public static create(parent: MergeObserver, currentStream: Stream, groupDisposable:GroupDisposable) {
        var obj = new this(parent, currentStream, groupDisposable);

        return obj;
    }

    constructor(parent: MergeObserver, currentStream: Stream, groupDisposable:GroupDisposable) {
        super(null, null, null);

        this._parent = parent;
        this._currentStream = currentStream;
        this._groupDisposable = groupDisposable;
    }

    public disposable:SingleDisposable = null;

    private _parent: MergeObserver = null;
    private _currentStream: Stream = null;
    private _groupDisposable:GroupDisposable = null;

    protected onNext(value) {
        this._parent.currentObserver.next(value);
    }

    protected onError(error) {
        this._parent.currentObserver.error(error);
    }

    protected onCompleted() {
        var parent = this._parent;

        if(!!this.disposable){
            this.disposable.dispose();
            this._groupDisposable.remove(this.disposable);
        }

        if (parent.q.length > 0) {
            parent.handleSubscribe(parent.q.shift());
        }
        else {
            parent.activeCount -= 1;
            if (this._isAsync() && parent.activeCount === 0){
                parent.currentObserver.completed();
            }
        }
    }

    private _isAsync() {
        return this._parent.done;
    }
}