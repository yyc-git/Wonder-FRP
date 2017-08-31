import { Entity } from "../core/Entity";
import { IDisposable } from "./IDisposable";

export class SingleDisposable extends Entity implements IDisposable {
    public static create(dispose: IDisposable | Function = null) {
        var obj = new this(dispose);

        return obj;
    }

    private _disposable: IDisposable | Function = null;
    private _isDisposed: boolean = false;

    constructor(dispose: IDisposable | Function) {
        super("SingleDisposable");

        this._disposable = dispose;
    }

    public setDispose(disposable: IDisposable) {
        this._disposable = disposable;
    }

    public dispose() {
        if (this._isDisposed) {
            return;
        }

        this._isDisposed = true;

        if (!this._disposable) {
            return;
        }

        if (!!(this._disposable as IDisposable).dispose) {
            (this._disposable as IDisposable).dispose();
        }
        else {
            (this._disposable as Function)();
        }
    }
}