import { JudgeUtils } from "../JudgeUtils";
import { Log } from "wonder-commonlib/dist/commonjs/Log";

declare var global: NodeJS.Global, window: Window;

export var root: any;

if (JudgeUtils.isNodeJs() && typeof global != "undefined") {
    root = global;
}
else if(typeof window != "undefined"){
    root = window;
}
else if(typeof self != "undefined"){
    /*!
     in web worker
     */
    root = self;
}
else{
    Log.error("no avaliable root!");
}
