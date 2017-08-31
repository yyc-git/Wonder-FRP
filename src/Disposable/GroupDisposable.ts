import { Entity } from "../core/Entity";
import { IDisposable } from "./IDisposable";
import { Collection } from "wonder-commonlib/dist/es2015/Collection";

export class GroupDisposable extends Entity implements IDisposable {
    public static create(disposable?: IDisposable) {
        var obj = new this(disposable);

        return obj;
    }

    private _group: Collection<IDisposable> = Collection.create<IDisposable>();
    private _isDisposed: boolean = false;

    constructor(disposable?: IDisposable) {
        super("GroupDisposable");

        if (disposable) {
            this._group.addChild(disposable);
        }
    }

    public add(disposable: IDisposable) {
        this._group.addChild(disposable);

        return this;
    }

    public remove(disposable: IDisposable) {
        this._group.removeChild(disposable);

        return this;
    }

    public getCount(){
        return this._group.getCount();
    }

    public dispose() {
        if (this._isDisposed) {
            return;
        }

        this._isDisposed = true;

        this._group.forEach((disposable: IDisposable) => {
            disposable.dispose();
        });
    }
}