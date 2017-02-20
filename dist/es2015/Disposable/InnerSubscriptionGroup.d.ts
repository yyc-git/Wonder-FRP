import { IDisposable } from "./IDisposable";
export declare class InnerSubscriptionGroup implements IDisposable {
    static create(): InnerSubscriptionGroup;
    private _container;
    addChild(child: IDisposable): void;
    dispose(): void;
}
