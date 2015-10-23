/// <reference path="../definitions.d.ts"/>
module dyRt{
    declare var global:any,window:any;

    export var root:any;
    Object.defineProperty(dyRt, "root", {
        get: function() {
            if(JudgeUtils.isNodeJs()){
                return global;
            }

            return window;
        }
    });
}
