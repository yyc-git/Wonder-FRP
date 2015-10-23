/// <reference path="../definitions.d.ts"/>

module dyRt{
    //rsvp.js
    //declare var RSVP:any;

    //not swallow the error
    if(root.RSVP){
        root.RSVP.onerror = function(e) {
            throw e;
        };
        root.RSVP.on('error', root.RSVP.onerror);
    }
}

