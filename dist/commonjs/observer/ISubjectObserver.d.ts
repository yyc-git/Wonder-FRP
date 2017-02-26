import { Observer } from "../core/Observer";
export interface ISubjectObserver {
    addChild(observer: Observer): any;
    removeChild(observer: Observer): any;
}
