module wdFrp{
    declare var global:any,window:any;

    export var root:any;
    Object.defineProperty(wdFrp, "root", {
        get: function() {
            if(JudgeUtils.isNodeJs()){
                return global;
            }

            return window;
        }
    });
}
