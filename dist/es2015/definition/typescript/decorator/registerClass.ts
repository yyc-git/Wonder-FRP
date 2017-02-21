import { ClassMapUtils } from "../../../utils/ClassMapUtils";

export function registerClass(className:string) {
    return function (target) {
        ClassMapUtils.addClassMap(className, target);
    }
}

