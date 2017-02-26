export class ClassMapUtils {
    private static _classMap: ClassMapData = {};

    public static addClassMap(className: string, _class: any) {
        this._classMap[className] = _class;
    }

    public static getClass(className: string) {
        return this._classMap[className];
    }
}

type ClassMapData = {
    [className: string]: any;
}
