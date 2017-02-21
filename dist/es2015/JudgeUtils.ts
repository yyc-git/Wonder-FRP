import { JudgeUtils as JudgeUtils$ } from "wonder-commonlib/dist/es2015/utils/JudgeUtils";
import { Entity } from "./core/Entity";
import { IObserver } from "./observer/IObserver";

export class JudgeUtils extends JudgeUtils$ {
    public static isPromise(obj) {
        return !!obj
            && !super.isFunction(obj.subscribe)
            && super.isFunction(obj.then);
    }

    public static isEqual(ob1: Entity, ob2: Entity) {
        return ob1.uid === ob2.uid;
    }

    public static isIObserver(i: IObserver) {
        return i.next && i.error && i.completed;
    }
}