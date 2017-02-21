import { Observer } from "../core/Observer";
import { IObserver } from "./IObserver";

export class ConcatObserver extends Observer {
    public static create(currentObserver: IObserver, startNextStream: Function) {
        return new this(currentObserver, startNextStream);
    }

    //private currentObserver:IObserver = null;
    protected currentObserver: any = null;
    private _startNextStream: Function = null;

    constructor(currentObserver: IObserver, startNextStream: Function) {
        super(null, null, null);

        this.currentObserver = currentObserver;
        this._startNextStream = startNextStream;
    }

    protected onNext(value) {
        /*!
        if "this.currentObserver.next" error, it will pase to this.currentObserver->onError.
        so it shouldn't invoke this.currentObserver.error here again!
         */
        //try{
        this.currentObserver.next(value);
        //}
        //catch(e){
        //    this.currentObserver.error(e);
        //}
    }

    protected onError(error) {
        this.currentObserver.error(error);
    }

    protected onCompleted() {
        //this.currentObserver.completed();
        this._startNextStream();
    }
}