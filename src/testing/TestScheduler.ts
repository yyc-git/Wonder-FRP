/// <reference path="../core/Scheduler"/>
/// <reference path="MockObserver"/>
/// <reference path="../Hash"/>
module dyRt {
    const SUBSCRIBE_TIME = 200;
    const DISPOSE_TIME = 1000;

    export class TestScheduler extends Scheduler {
        public static next(tick, value) {
            return new Record(tick, value);
        }

        public static error(tick, error) {
            return new Record(tick, error);
        }

        public static completed(tick) {
            return new Record(tick, null);
        }

        private _clock:number = null;
        get clock() {
            return this._clock;
        }

        set clock(clock:number) {
            this._clock = clock;
        }

        private _isDisposed:boolean = false;
        private _timerMap:Hash = Hash.create();

        public remove(observer:Observer) {
            //this._queue.removeChild(function (ob:Observer) {
            //    return ob.oid === observer.oid;
            //});

            this._isDisposed = true;
        }

        //todo refactor, need abstract
        public publishRecursive(initial:any, recursiveFunc:Function) {
            var self = this;

            //todo judge dispose
            recursiveFunc(initial, function (value) {
                self.publishNext(value);
                //self._clock++;
                self._tick(1);
            }, function () {
                self.publishCompleted();
            });
        }

        public publishInterval(initial:any, interval:number, action:Function) {
            //produce 10 val for test
            var COUNT = 10;
            var self = this;

            while (COUNT > 0 && !this._isDisposed) {
                //self._clock += interval;
                self._tick(interval);

                action(initial);

                initial++;
                COUNT--;
            }
        }

        public startWithTime(create:Function, subscribedTime:number, disposedTime:number) {
            var observer = this.createObserver(),
                source, subscription;

            this._clock = subscribedTime;

            //todo refactor, set tick
            source = create();

            this._runAt(subscribedTime, function () {
                subscription = source.subscribe(observer);
            });

            this._runAt(disposedTime, function () {
                //todo refactor

                //subscription.dispose();
                observer.dispose();
            });

            this._start(subscribedTime);

            return observer;
        }

        private _runAt(time:number, callback:Function) {
            //use hash
            //register
            this._timerMap.addChild(String(time), callback);
        }

        private _tick(time:number) {
            var callback = null;
            //trigger callback
            this._clock += time;

            callback = this._timerMap.getChild(String(this._clock));
            callback && callback();
        }

        private _start(subscribedTime:number) {
            var callback = null;

            this._clock = subscribedTime;

            callback = this._timerMap.getChild(String(subscribedTime));
            if(callback){
                callback();
            }
            else{
                throw new Error("not subscribe");
            }
        }

        startWithSubscribe(create, subscribedTime = SUBSCRIBE_TIME) {
            return this.startWithTime(create, subscribedTime, DISPOSE_TIME);
        }

        startWithDispose(create, disposedTime = DISPOSE_TIME) {
            return this.startWithTime(create, SUBSCRIBE_TIME, disposedTime);
        }

        /**
         * Creates an observer that records received notification messages and timestamps those.
         * @return Observer that can be used to assert the timing of received notifications.
         */
        createObserver() {
            return new MockObserver(this);
        }
    }
}
