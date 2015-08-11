/// <reference path="../definitions.d.ts"/>

module dyRt{
    //rsvp.js
    //declare var RSVP:any;
    declare var window:any;

    //not swallow the error
    if(window.RSVP){
        window.RSVP.onerror = function(e) {
            throw e;
        };
        window.RSVP.on('error', window.RSVP.onerror);
    }
}

