declare var global:NodeJS.Global,window:Window;

module wdFrp{
    export var root:any;

    if(JudgeUtils.isNodeJs() && typeof global != "undefined"){
        root = global;
    }
    else{
        root = window;
    }
}


