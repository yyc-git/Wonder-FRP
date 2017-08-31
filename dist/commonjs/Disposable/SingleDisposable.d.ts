import { Entity } from "../core/Entity";
import { IDisposable } from "./IDisposable";
export declare class SingleDisposable extends Entity implements IDisposable {
    static create(dispose?: IDisposable | Function): SingleDisposable;
    private _disposable;
    private _isDisposed;
    constructor(dispose: IDisposable | Function);
    setDispose(disposable: IDisposable): void;
    dispose(): void;
}
