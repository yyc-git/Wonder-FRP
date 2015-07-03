/// <reference path="../stream/FromArrayStream"/>
module dyRt{
    //todo add parent?
export var createStream = function(subscribeFunc) {
    return new AnonymousStream(subscribeFunc);
}
    export var fromArray = function(array:[any]){
        return new FromArrayStream(array);
    };
}

