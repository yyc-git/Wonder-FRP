import { BaseStream } from "./BaseStream";
import { IObserver } from "../observer/IObserver";
import { SingleDisposable } from "../Disposable/SingleDisposable";
export declare class FromEventPatternStream extends BaseStream {
    static create(addHandler: Function, removeHandler: Function): FromEventPatternStream;
    private _addHandler;
    private _removeHandler;
    constructor(addHandler: Function, removeHandler: Function);
    subscribeCore(observer: IObserver): SingleDisposable;
}
