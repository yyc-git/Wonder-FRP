/// <reference path="../filePath.d.ts"/>
module dyRt{
    export interface ISubjectObserver {
        addChild(observer:Observer);
        removeChild(observer:Observer);
    }
}
