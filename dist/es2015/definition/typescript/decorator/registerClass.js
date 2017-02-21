import { ClassMapUtils } from "../../../utils/ClassMapUtils";
export function registerClass(className) {
    return function (target) {
        ClassMapUtils.addClassMap(className, target);
    };
}
//# sourceMappingURL=registerClass.js.map