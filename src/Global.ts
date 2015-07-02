module dyRt{
    export var ABSTRACT_METHOD:Function = function(){
        return new Error("abstract method need override");
    };
    export var ABSTRACT_ATTRIBUTE:any = null;
}
