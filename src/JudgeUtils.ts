/// <reference path="./filePath.d.ts"/>
module wdFrp {
    export class JudgeUtils extends wdCb.JudgeUtils {
        public static isPromise(obj){
            return !!obj
                && !super.isFunction(obj.subscribe)
                && super.isFunction(obj.then);
        }

        public static isEqual(ob1:Entity, ob2:Entity){
            return ob1.uid === ob2.uid;
        }
    }
}
