import { IDisposable } from "./IDisposable";
import { Collection } from "wonder-commonlib/dist/commonjs/Collection";

export class InnerSubscriptionGroup implements IDisposable {
    public static create() {
        var obj = new this();

        return obj;
    }

    private _container: Collection<IDisposable> = Collection.create<IDisposable>();

    public addChild(child: IDisposable) {
        this._container.addChild(child);
    }

    public dispose() {
        this._container.forEach((child: IDisposable) => {
            child.dispose();
        });
    }
}