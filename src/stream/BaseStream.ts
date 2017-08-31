import { Stream } from "../core/Stream";
import { IObserver } from "../observer/IObserver";
import { IDisposable } from "../Disposable/IDisposable";
import { Observer } from "../core/Observer";
import { Subject } from "../subject/Subject";
import { AutoDetachObserver } from "../observer/AutoDetachObserver";

export abstract class BaseStream extends Stream {
    public abstract subscribeCore(observer: IObserver): IDisposable;

    // private _isBuildStream:boolean = false;
    // private _disposable:IDisposable = null;

    public subscribe(arg1: Function | Observer | Subject, onError?, onCompleted?): IDisposable {
        var observer: Observer = null;

        if (this.handleSubject(arg1)) {
            return;
        }

        observer = arg1 instanceof Observer
            ? AutoDetachObserver.create(<IObserver>arg1)
            : AutoDetachObserver.create(<Function>arg1, onError, onCompleted);

        //observer.setDisposeHandler(this.disposeHandler);


        observer.setDisposable(this.buildStream(observer));

        return observer;
    }

    public buildStream(observer: IObserver): IDisposable {
        super.buildStream(observer);

        return this.subscribeCore(observer);
    }

    //private _hasMultiObservers(){
    //    return this.scheduler.getObservers() > 1;
    //}
}