/// <reference path="../core/Scheduler"/>
/// <reference path="MockObserver"/>
/// <reference path="../Hash"/>
/// <reference path="TestStream"/>
module dyRt {
    const SUBSCRIBE_TIME = 200;
    const DISPOSE_TIME = 1000;

    export class TestScheduler extends Scheduler {
        public static next(tick, value) {
            return new Record(tick, value, ActionType.NEXT);
        }

        public static error(tick, error) {
            return new Record(tick, error, ActionType.ERROR);
        }

        public static completed(tick) {
            return new Record(tick, null, ActionType.COMPLETED);
        }

        private _clock:number = null;
        get clock() {
            return this._clock;
        }

        set clock(clock:number) {
            this._clock = clock;
        }

        private _isDisposed:boolean = false;
        private _lastTime:number = null;
        private _timerMap:Hash = Hash.create();
        private _streamMap:Hash = Hash.create();
        private _subscribedTime:number = null;
        private _disposedTime:number = null;


        public setStreamMap(messages:[Record]){
            var self = this;

            messages.forEach(function(record:Record){
                var func = null;

                switch (record.actionType){
                    case ActionType.NEXT:
                        func = function(){
                            self.next(record.value);
                        };
                        break;
                    case ActionType.ERROR:
                        func = function(){
                            self.error(record.value);
                        };
                        break;
                    case ActionType.COMPLETED:
                        func = function(){
                            self.completed();
                        };
                        break;
                    default:
                        Log.error(true, Log.info.FUNC_UNKNOW("actionType"));
                        break;
                }

                self._streamMap.addChild(String(record.time), func);
            });
        }

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
                //self.publishNext(value);
                self.next(value);
                //self._clock++;
                self._tick(1);
            }, function () {
                //self.publishCompleted();
                self.target.completed();
            });
            //recursiveFunc(initial, function(initial, selfFunc){
            //    self._tick(1);
            //
            //    recursiveFunc(initial, selfFunc);
            //});
        }

        public publishInterval(initial:any, interval:number, action:Function):number{
            //    var self = this;
            //
            //this.queue.forEach(function(ob:Observer){
            //    //produce 10 val for test
            //    var COUNT = 10;
            //
            //    while (COUNT > 0 && !self._isDisposed) {
            //        //self._clock += interval;
            //        self._tick(interval);
            //
            //        action(ob, initial);
            //
            //        initial++;
            //        COUNT--;
            //    }
            //});
            //
            //return Collection.create();

            //produce 10 val for test
            var COUNT = 10;

            while (COUNT > 0 && !this._isDisposed) {
                //self._clock += interval;
                this._tick(interval);

                action(initial);

                initial++;
                COUNT--;
            }

            return NaN;
        }

        public startWithTime(create:Function, subscribedTime:number, disposedTime:number) {
            var observer = this.createObserver(),
                source, subscription;

            this._subscribedTime = subscribedTime;
            this._disposedTime = disposedTime;

            this._clock = subscribedTime;

            //source = create();

            this._runAt(subscribedTime, function () {
                source = create();
                subscription = source.subscribe(observer);
            });

            this._runAt(disposedTime, function () {
                observer.dispose();
            });

            this.start();

            return observer;
        }

        public startWithSubscribe(create, subscribedTime = SUBSCRIBE_TIME) {
            return this.startWithTime(create, subscribedTime, DISPOSE_TIME);
        }

        public startWithDispose(create, disposedTime = DISPOSE_TIME) {
            return this.startWithTime(create, SUBSCRIBE_TIME, disposedTime);
        }

        public publicAbsolute(time, handler) {
            this._runAt(time, function () {
                handler();
            });
        }

        public start() {
            var extremeNumArr = this._getMinAndMaxTime(),
                min = extremeNumArr[0],
                max = extremeNumArr[1],
                time = min;

            while (time <= max) {
                this._clock = time;

                this._exec(time, this._timerMap);
                this._runStream(time);
                //this._exec(time, this._streamMap);

                time++;
            }
        }

        public createStream(args){
            this.setStreamMap(Array.prototype.slice.call(arguments, 0));

            return new TestStream(Array.prototype.slice.call(arguments, 0), this);
        }

        /**
         * Creates an observer that records received notification messages and timestamps those.
         * @return Observer that can be used to assert the timing of received notifications.
         */
        public createObserver() {
            return new MockObserver(this);
        }

        private _getMinAndMaxTime(){
            var timeArr = this._timerMap.getKeys().concat(this._streamMap.getKeys())
            //var timeArr = this._timerMap.getKeys()
                .map(function(key){
                    return Number(key);
                });

            return [Math.min.apply(Math, timeArr), Math.max.apply(Math, timeArr)];
            //return [this._subscribedTime, this._disposedTime];
        }

        private _exec(time, map){
            var handler = map.getChild(String(time));

            if(handler){
                handler();
            }
        }

        private _runStream(time){
            var handler = this._streamMap.getChild(String(time));

            if(handler && this._hasObservers()){
                handler();
            }
        }

        private _hasObservers(){
            if(this.target instanceof Subject){
                let subject = <Subject>this.target;

                 return subject.getObservers() > 0
            }

            return !!this.target;
        }
        /**
         * exec (lastTime, currentTime]
         * @param lastTime
         * @param currentTime
         * @param map
         * @private
         */
        private _execRange(lastTime, currentTime, map){
            var time = lastTime;

            if(!lastTime){
                this._exec(currentTime, map);
                return;
            }

            time++;
            while(time <= currentTime){
                this._exec(time, map);
                time++;
            }
        }

        private _runAt(time:number, callback:Function) {
            this._timerMap.addChild(String(time), callback);
        }

        private _tick(time:number) {
            this._clock += time;

            this._execRange(this._lastTime, this._clock, this._timerMap);
            this._lastTime = this._clock;
        }
    }
}


