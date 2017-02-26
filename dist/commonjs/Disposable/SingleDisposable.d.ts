import { Entity } from "../core/Entity";
import { IDisposable } from "./IDisposable";
export declare class SingleDisposable extends Entity implements IDisposable {
    static create(disposeHandler?: Function): SingleDisposable;
    private _disposeHandler;
    private _isDisposed;
    constructor(disposeHandler: Function);
    setDisposeHandler(handler: Function): void;
    dispose(): void;
}
