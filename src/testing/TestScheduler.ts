module wdFrp {
    const SUBSCRIBE_TIME = 200;
    const DISPOSE_TIME = 1000;

    export class TestScheduler extends Scheduler {
        public static next(tick, value) {
            return Record.create(tick, value, ActionType.NEXT);
        }

        public static error(tick, error) {
            return Record.create(tick, error, ActionType.ERROR);
        }

        public static completed(tick) {
            return Record.create(tick, null, ActionType.COMPLETED);
        }

        public static create(isReset:boolean = false) {
            var obj = new this(isReset);

            return obj;
        }

        constructor(isReset:boolean){
            super();

            this._isReset = isReset;
        }

        private _clock:number = null;
        get clock() {
            return this._clock;
        }

        set clock(clock:number) {
            this._clock = clock;
        }

        private _isReset:boolean = false;
        private _isDisposed:boolean = false;
        private _timerMap:wdCb.Hash<Function> = wdCb.Hash.create<Function>();
        private _streamMap:wdCb.Hash<Function> = wdCb.Hash.create<Function>();
        private _subscribedTime:number = null;
        private _disposedTime:number = null;
        private _observer:MockObserver = null;

        public setStreamMap(observer:IObserver, messages:[Record]){
            var self = this;

            messages.forEach((record:Record) =>{
                var func = null;

                switch (record.actionType){
                    case ActionType.NEXT:
                        func = () =>{
                            observer.next(record.value);
                        };
                        break;
                    case ActionType.ERROR:
                        func = () =>{
                            observer.error(record.value);
                        };
                        break;
                    case ActionType.COMPLETED:
                        func = () =>{
                            observer.completed();
                        };
                        break;
                    default:
                        wdCb.Log.error(true, wdCb.Log.info.FUNC_UNKNOW("actionType"));
                        break;
                }

                self._streamMap.addChild(String(record.time), func);
            });
        }

        public remove(observer:Observer) {
            this._isDisposed = true;
        }

        public publishRecursive(observer:MockObserver, initial:any, recursiveFunc:Function) {
            var self = this,
                //messages = [],
                next = null,
                completed = null;

            this._setClock();

            next = observer.next;
            completed = observer.completed;

            observer.next = (value) => {
                next.call(observer, value);
                self._tick(1);
            };

            observer.completed = () => {
                completed.call(observer);
                self._tick(1);
            };

            recursiveFunc(initial);
        }

        public publishInterval(observer:IObserver, initial:any, interval:number, action:Function):number{
            //produce 10 val for test
            var COUNT = 10,
                messages = [];

            this._setClock();

            while (COUNT > 0 && !this._isDisposed) {
                this._tick(interval);
                messages.push(TestScheduler.next(this._clock, initial));

                //no need to invoke action
                //action(initial);

                initial++;
                COUNT--;
            }

            this.setStreamMap(observer, <[Record]>messages);
            //this.setStreamMap(this._observer, <[Record]>messages);

            return NaN;
        }

        public publishIntervalRequest(observer:IObserver, action:Function):number{
            //produce 10 val for test
            var COUNT = 10,
                messages = [],
                interval = 100,
                num = 0;

            this._setClock();

            while (COUNT > 0 && !this._isDisposed) {
                this._tick(interval);
                messages.push(TestScheduler.next(this._clock, num));

                num++;
                COUNT--;
            }

            this.setStreamMap(observer, <[Record]>messages);
            //this.setStreamMap(this._observer, <[Record]>messages);

            return NaN;
        }

        private _setClock(){
            if(this._isReset){
                this._clock = this._subscribedTime;
            }
        }

        public startWithTime(create:Function, subscribedTime:number, disposedTime:number) {
            var observer = this.createObserver(),
                source, subscription,
                self = this;

            this._subscribedTime = subscribedTime;
            this._disposedTime = disposedTime;

            this._clock = subscribedTime;

            this._runAt(subscribedTime, () => {
                source = create();
                subscription = source.subscribe(observer);
            });

            this._runAt(disposedTime, () => {
                subscription.dispose();
                self._isDisposed = true;
            });

            this._observer = observer;

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
            this._runAt(time, () => {
                handler();
            });
        }

        public start() {
            var extremeNumArr = this._getMinAndMaxTime(),
                min = extremeNumArr[0],
                max = extremeNumArr[1],
                time = min;

            //todo reduce loop time
            while (time <= max) {
                //if(this._isDisposed){
                //    break;
                //}

                //because "_exec,_runStream" may change "_clock",
                //so it should reset the _clock

                this._clock = time;

                this._exec(time, this._timerMap);

                this._clock = time;

                this._runStream(time);

                time++;

                //todo get max time only from streamMap?
                //need refresh max time.
                //because if timerMap has callback that create infinite stream(as interval),
                //it will set streamMap so that the max time will change
                max = this._getMinAndMaxTime()[1];
            }
        }

        public createStream(args){
            return TestStream.create(Array.prototype.slice.call(arguments, 0), this);
        }

        public createObserver() {
            return MockObserver.create(this);
        }

        public createResolvedPromise(time:number, value:any){
            return MockPromise.create(this, [TestScheduler.next(time, value), TestScheduler.completed(time+1)]);
        }

        public createRejectPromise(time:number, error:any){
            return MockPromise.create(this, [TestScheduler.error(time, error)]);
        }

        private _getMinAndMaxTime(){
            var timeArr:any = (this._timerMap.getKeys().addChildren(this._streamMap.getKeys()));

                timeArr = timeArr.map((key) => {
                    return Number(key);
                }).toArray();

            return [Math.min.apply(Math, timeArr), Math.max.apply(Math, timeArr)];
        }

        private _exec(time, map){
            var handler = map.getChild(String(time));

            if(handler){
                handler();
            }
        }

        private _runStream(time){
            var handler = this._streamMap.getChild(String(time));

            if(handler){
                handler();
            }
        }

        private _runAt(time:number, callback:Function) {
            this._timerMap.addChild(String(time), callback);
        }

        private _tick(time:number) {
            this._clock += time;
        }
    }
}


