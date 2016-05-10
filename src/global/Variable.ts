declare var global:any,window:Window;

module wdFrp{
    export var root:any;

    if(JudgeUtils.isNodeJs()){
        root = global;
    }
    else{
        root = window;
    }
}


