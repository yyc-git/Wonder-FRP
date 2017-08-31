import { Log } from "wonder-commonlib/dist/commonjs/Log";
import { Observer } from "../core/Observer";
import { IObserver } from "./IObserver";
import { Stream } from "../core/Stream";
import { GroupDisposable } from "../Disposable/GroupDisposable";
import { requireCheck, assert } from "../definition/typescript/decorator/contract";
import { JudgeUtils } from "../JudgeUtils";
import { fromPromise } from "../global/Operator";
import { SingleDisposable } from "../Disposable/SingleDisposable";

export class MergeAllObserver extends Observer {
    public static create(currentObserver: IObserver, groupDisposable: GroupDisposable) {
        return new this(currentObserver, groupDisposable);
    }

    constructor(currentObserver: IObserver, groupDisposable: GroupDisposable) {
        super(null, null, null);

        this.currentObserver = currentObserver;
        this._groupDisposable = groupDisposable;
    }

    public done: boolean = false;
    public currentObserver: IObserver = null;

    private _groupDisposable: GroupDisposable = null;

    @requireCheck(function(innerSource: any) {
        assert(innerSource instanceof Stream || JudgeUtils.isPromise(innerSource), Log.info.FUNC_MUST_BE("innerSource", "Stream or Promise"));

    })
    protected onNext(innerSource: any) {
        if (JudgeUtils.isPromise(innerSource)) {
            innerSource = fromPromise(innerSource);
        }

        let disposable = SingleDisposable.create(),
            innerObserver = InnerObserver.create(this, innerSource, this._groupDisposable);

        this._groupDisposable.add(disposable);

        innerObserver.disposable = disposable;

        disposable.setDispose(innerSource.buildStream(innerObserver));
    }

    protected onError(error) {
        this.currentObserver.error(error);
    }

    protected onCompleted() {
        this.done = true;

        if (this._groupDisposable.getCount() <= 1) {
            this.currentObserver.completed();
        }
    }
}

class InnerObserver extends Observer {
    public static create(parent: MergeAllObserver, currentStream: Stream, groupDisposable:GroupDisposable) {
        var obj = new this(parent, currentStream, groupDisposable);

        return obj;
    }

    constructor(parent: MergeAllObserver, currentStream: Stream, groupDisposable:GroupDisposable) {
        super(null, null, null);

        this._parent = parent;
        this._currentStream = currentStream;
        this._groupDisposable = groupDisposable;
    }

    public disposable:SingleDisposable = null;

    private _parent: MergeAllObserver = null;
    private _currentStream: Stream = null;
    private _groupDisposable:GroupDisposable = null;

    protected onNext(value) {
        this._parent.currentObserver.next(value);
    }

    protected onError(error) {
        this._parent.currentObserver.error(error);
    }

    protected onCompleted() {
        var currentStream = this._currentStream,
            parent = this._parent;

        if(!!this.disposable){
            this.disposable.dispose();
            this._groupDisposable.remove(this.disposable);
        }

        /*!
        if this innerSource is async stream(as promise stream),
        it will first exec all parent.next and one parent.completed,
        then exec all this.next and all this.completed
        so in this case, it should invoke parent.currentObserver.completed after the last invokcation of this.completed(have invoked all the innerSource)
        */
        if (this._isAsync() && this._groupDisposable.getCount() <= 1){
            parent.currentObserver.completed();
        }
    }

    private _isAsync() {
        return this._parent.done;
    }
}
