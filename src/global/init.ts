/// <reference path="../definitions.d.ts"/>

module dyRt{
    //rsvp.js
    declare var RSVP:any;

    //not swallow the error
    if(RSVP){
        RSVP.onerror = function(e) {
            throw e;
        };
        RSVP.on('error', RSVP.onerror);
    }
}

