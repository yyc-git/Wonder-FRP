import { Observer } from "../core/Observer";

export interface ISubjectObserver {
    addChild(observer: Observer);
    removeChild(observer: Observer);
}