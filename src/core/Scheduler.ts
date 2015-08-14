/// <reference path="../definitions.d.ts"/>
module dyRt {
    root.requestNextAnimationFrame = (function () {
        var originalRequestAnimationFrame = undefined,
            wrapper = undefined,
            callback = undefined,
            geckoVersion = null,
            userAgent = navigator.userAgent,
            index = 0,
            self = this;

        wrapper = function (time) {
            time = performance.now();
            self.callback(time);
        };

        /*!
         bug!
         below code:
         when invoke b after 1s, will only invoke b, not invoke a!

         function a(time){
         console.log("a", time);
         webkitRequestAnimationFrame(a);
         }

         function b(time){
         console.log("b", time);
         webkitRequestAnimationFrame(b);
         }

         a();

         setTimeout(b, 1000);



         so use requestAnimationFrame priority!
         */
        if(root.requestAnimationFrame) {
            return requestAnimationFrame;
        }


        // Workaround for Chrome 10 bug where Chrome
        // does not pass the time to the animation function

        if (root.webkitRequestAnimationFrame) {
            // Define the wrapper

            // Make the switch

            originalRequestAnimationFrame = root.webkitRequestAnimationFrame;

            root.webkitRequestAnimationFrame = function (callback, element) {
                self.callback = callback;

                // Browser calls the wrapper and wrapper calls the callback

                return originalRequestAnimationFrame(wrapper, element);
            }
        }

        //修改time参数
        if (root.msRequestAnimationFrame) {
            originalRequestAnimationFrame = root.msRequestAnimationFrame;

            root.msRequestAnimationFrame = function (callback) {
                self.callback = callback;

                return originalRequestAnimationFrame(wrapper);
            }
        }

        // Workaround for Gecko 2.0, which has a bug in
        // mozRequestAnimationFrame() that restricts animations
        // to 30-40 fps.

        if (root.mozRequestAnimationFrame) {
            // Check the Gecko version. Gecko is used by browsers
            // other than Firefox. Gecko 2.0 corresponds to
            // Firefox 4.0.

            index = userAgent.indexOf('rv:');

            if (userAgent.indexOf('Gecko') != -1) {
                geckoVersion = userAgent.substr(index + 3, 3);

                if (geckoVersion === '2.0') {
                    // Forces the return statement to fall through
                    // to the setTimeout() function.

                    root.mozRequestAnimationFrame = undefined;
                }
            }
        }

        return root.webkitRequestAnimationFrame ||
            root.mozRequestAnimationFrame ||
            root.oRequestAnimationFrame ||
            root.msRequestAnimationFrame ||

            function (callback, element) {
                var start,
                    finish;

                root.setTimeout(function () {
                    start = performance.now();
                    callback(start);
                    finish = performance.now();

                    self.timeout = 1000 / 60 - (finish - start);

                }, self.timeout);
            };
    }());

    root.cancelNextRequestAnimationFrame = root.cancelRequestAnimationFrame
        || root.webkitCancelAnimationFrame
        || root.webkitCancelRequestAnimationFrame
        || root.mozCancelRequestAnimationFrame
        || root.oCancelRequestAnimationFrame
        || root.msCancelRequestAnimationFrame
        || clearTimeout;


    export class Scheduler{
        //todo remove "...args"
        public static create(...args) {
            var obj = new this();

            return obj;
        }

        private _requestLoopId:any = null;
        get requestLoopId(){
            return this._requestLoopId;
        }
        set requestLoopId(requestLoopId:any){
            this._requestLoopId = requestLoopId;
        }

        //observer is for TestScheduler to rewrite

        public publishRecursive(observer:IObserver, initial:any, action:Function){
            action(initial);
        }

        public publishInterval(observer:IObserver, initial:any, interval:number, action:Function):number{
            return root.setInterval(() => {
                initial = action(initial);
            }, interval)
        }

        public publishIntervalRequest(observer:IObserver, action:Function){
            var self = this,
                loop = (time) => {
                action(time);

                self._requestLoopId = root.requestNextAnimationFrame(loop);
            };

            this._requestLoopId = root.requestNextAnimationFrame(loop);
        }
    }
}
