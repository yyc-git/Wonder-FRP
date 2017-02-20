import { IDisposable } from "./IDisposable";
import { Subject } from "../subject/Subject";
import { GeneratorSubject } from "../subject/GeneratorSubject";
import { Observer } from "../core/Observer";
export declare class InnerSubscription implements IDisposable {
    static create(subject: Subject | GeneratorSubject, observer: Observer): InnerSubscription;
    private _subject;
    private _observer;
    constructor(subject: Subject | GeneratorSubject, observer: Observer);
    dispose(): void;
}
