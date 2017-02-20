import { BaseStream } from "./BaseStream";
import { IObserver } from "../observer/IObserver";
import { GroupDisposable } from "../Disposable/GroupDisposable";
export declare class DeferStream extends BaseStream {
    static create(buildStreamFunc: Function): DeferStream;
    private _buildStreamFunc;
    constructor(buildStreamFunc: Function);
    subscribeCore(observer: IObserver): GroupDisposable;
}
