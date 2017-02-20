import { Entity } from "../core/Entity";
import { IDisposable } from "./IDisposable";
export declare class GroupDisposable extends Entity implements IDisposable {
    static create(disposable?: IDisposable): GroupDisposable;
    private _group;
    private _isDisposed;
    constructor(disposable?: IDisposable);
    add(disposable: IDisposable): this;
    remove(disposable: IDisposable): this;
    dispose(): void;
}
