/// <reference path="MockObserver"/>
module dyRt {
    export class TestScheduler {
        public static next(tick, value){
            return new Record(tick, value);
        }

        public static error(tick, error){
            return new Record(tick, error);
        }

        public static completed(tick){
            return new Record(tick, null);
        }

        private _clock:number = null;
        get clock(){
            return this._clock;
        }
        set clock(clock:number){
            this._clock = clock;
        }

        ///** Default virtual time used for creation of observable sequences in unit tests. */
        //created: 100,
        /** Default virtual time used to subscribe to observable sequences in unit tests. */
        private _subscribedTime = 200;

        ///** Default virtual time used to dispose subscriptions in unit tests. */
        //disposed: 1000,

        /**
         * Starts the test scheduler and uses the specified virtual times to invoke the factory function, subscribe to the resulting sequence, and dispose the subscription.
         *
         * @param create Factory method to create an observable sequence.
         * @param created Virtual time at which to invoke the factory to create an observable sequence.
         * @param subscribed Virtual time at which to subscribe to the created observable sequence.
         * @param disposed Virtual time at which to dispose the subscription.
         * @return Observer with timestamped recordings of notification messages that were received during the virtual time window when the subscription to the source sequence was active.
         */
        //startWithTiming(create, created, subscribed, disposed) {
        //    var observer = this.createObserver(),
        //        source, subscription;
        //
        //    this.scheduleAbsoluteWithState(null, created, function () {
        //        source = create();
        //        return disposableEmpty;
        //    });
        //
        //    this.scheduleAbsoluteWithState(null, subscribed, function () {
        //        subscription = source.subscribe(observer);
        //        return disposableEmpty;
        //    });
        //
        //    this.scheduleAbsoluteWithState(null, disposed, function () {
        //        subscription.dispose();
        //        return disposableEmpty;
        //    });
        //
        //    this.start();
        //
        //    return observer;
        //}

        /**
         * Starts the test scheduler and uses the specified virtual time to dispose the subscription to the sequence obtained through the factory function.
         * Default virtual times are used for factory invocation and sequence subscription.
         *
         * @param create Factory method to create an observable sequence.
         * @param disposed Virtual time at which to dispose the subscription.
         * @return Observer with timestamped recordings of notification messages that were received during the virtual time window when the subscription to the source sequence was active.
         */
        //    startWithDispose (create, disposed) {
        //    return this.startWithTiming(create, ReactiveTest.created, ReactiveTest.subscribed, disposed);
        //}

        /**
         * Starts the test scheduler and uses default virtual times to invoke the factory function, to subscribe to the resulting sequence, and to dispose the subscription.
         *
         * @param create Factory method to create an observable sequence.
         * @return Observer with timestamped recordings of notification messages that were received during the virtual time window when the subscription to the source sequence was active.
         */
        startWithCreate(create, subscribedTime?) {
            //return this.startWithTiming(create, ReactiveTest.created, ReactiveTest.subscribed, ReactiveTest.disposed);
            var observer = this.createObserver(),
                source, subscription;

            this._clock = subscribedTime || this._subscribedTime;

            source = create();

            subscription = source.subscribe(observer);

            subscription.dispose();

            return observer;
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
