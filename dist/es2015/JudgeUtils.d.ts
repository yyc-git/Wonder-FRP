/// <reference types="wonder-commonlib" />
import { JudgeUtils as JudgeUtils$ } from "wonder-commonlib/dist/es2015/utils/JudgeUtils";
import { Entity } from "./core/Entity";
import { IObserver } from "./observer/IObserver";
export declare class JudgeUtils extends JudgeUtils$ {
    static isPromise(obj: any): boolean;
    static isEqual(ob1: Entity, ob2: Entity): boolean;
    static isIObserver(i: IObserver): () => any;
}
